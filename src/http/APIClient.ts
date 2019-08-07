import ConsulClient from '@flowfact/consul-client';
import axios, { AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios';
import * as isNode from 'detect-node';
import { stringify } from 'qs';
import Authentication from '../authentication/Authentication';
import EnvironmentManagement from '../util/EnvironmentManagement';
import Interceptor from '../util/Interceptor';
import { APIService } from './APIMapping';

export type ParamMap = { [key: string]: string | boolean | number | undefined };

export interface APIClientAdditionalParams extends AxiosRequestConfig {
    headers?: string | ParamMap;
    queryParams?: ParamMap;
    cancelToken?: CancelToken;
}

export type MethodTypes = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTIONS' | 'PATCH' | 'HEAD';

export default abstract class APIClient {

    private userId: string;
    private _consulClient?: ConsulClient;
    private readonly _serviceName: string;
    private static languages: string = 'de';

    public static changeLanguages(newLanguages: string) {
        this.languages = newLanguages;
    }

    protected constructor(service: APIService) {
        this._serviceName = service.name;
    }

    public withUserId(userId: string): this {
        this.userId = userId;
        return this;
    }

    public async invokeApi<T = any>(path: string, method: MethodTypes = 'GET', body: string | {} = '', additionalParams: APIClientAdditionalParams = {}): Promise<AxiosResponse<T>> {
        if (!path.startsWith('/')) {
            throw new Error('Your path has to start with a slash. Path: ' + path);
        }

        const { queryParams, headers, cancelToken, ...others } = additionalParams;

        // add parameters to the url
        let url = (await this.buildAPIUrl()) + path;
        if (queryParams) {
            const queryString = stringify(queryParams, { addQueryPrefix: true });
            if (queryString && queryString !== '') {
                url += queryString;
            }
        }

        let userIdentification = {};
        if (!path.startsWith('/public')) {
            // setup the request
            if (isNode && this.userId) {
                userIdentification = {
                    userId: this.userId
                };
            } else if (!isNode) {
                const supportToken = localStorage.getItem('flowfact.support.token') || '';

                if (supportToken.length === 0) {
                    userIdentification = {
                        cognitoToken: (await Authentication.getCurrentSession())!.getIdToken()!.getJwtToken()
                    };
                } else {
                    userIdentification = {
                        'x-ff-support-token': supportToken
                    };
                }
            }
        }

        const languages: any = { 'Accept-Language': APIClient.languages };

        let request: AxiosRequestConfig = {
            method: method,
            url: url,
            headers: Object.assign({}, userIdentification, languages, headers || {}),
            data: body,
            cancelToken: cancelToken,
            ...others
        };

        const client = axios.create();
        for (const interceptor of Interceptor.interceptors) {
            if (interceptor.type === 'request') {
                axios.interceptors.request.use(interceptor.method);
            } else if (interceptor.type === 'response') {
                axios.interceptors.response.use(interceptor.method);
            }
        }

        // fire the request
        // NEVER put a catch here because it prevents all other error handling
        // i.e. you can't handle a service returning an http code >= 400 (which is possibly expected)
        return client.request<T>(request);
    }

    public async buildAPIUrl() {
        if (isNode) {
            const currentConfig = await this._getConsulClient().config.getCurrent();
            return `https://${currentConfig['com.flowfact.router.host']}/${this._serviceName}`;
        }

        return `${EnvironmentManagement.getBaseUrl()}/${this._serviceName}/${EnvironmentManagement.getVersionTag()}`;
    }

    private _getConsulClient(): ConsulClient {
        if (!this._consulClient) {
            // Dirty hack: Remove the protocol from the environment value. The Java Consul Client needs it, so the value
            // might contain the protocol. The nodejs consul client does not accept it for whatever reason.
            // @ts-ignore
            const consulUrl = (process.env.CONSUL_CLIENT_HOST || 'consulclients.development.flowfact-dev.cloud').replace(/https?:\/\//, '');
            // @ts-ignore
            const consulPort = process.env.CONSUL_CLIENT_PORT || '8500';

            // TODO figure out a way to get the name of the executing service here
            this._consulClient = new ConsulClient(consulUrl, consulPort, 'api-services', EnvironmentManagement.getStage(), EnvironmentManagement.getVersionTag());
        }

        return this._consulClient!;
    }
}
