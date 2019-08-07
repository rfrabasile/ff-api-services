import { AxiosResponse } from 'axios';
import { APIClient, APIMapping } from '../http';
import { Openimmo } from '@flowfact/types';

export class OpenimmoFtpAccessService extends APIClient {

    constructor() {
        super(APIMapping.openimmoFtpAccessService);
    }

    /**
     * get all openimmmos
     */
    async fetchAllOpenimmos(): Promise<AxiosResponse> {
        return await this.invokeApi('/ftp', 'GET', undefined);
    }

    /**
     * get one openimmo by using user
     * @param user
     */
    async fetchOpenimmo(user: string): Promise<AxiosResponse> {
        return await this.invokeApi(`/ftp/${user}`, 'GET');
    }

    /**
     * update an openimmo
     * @param user
     * @param openimmo
     */
    async updateOpenimmo(user: string, openimmo: Openimmo) {
        return await this.invokeApi(`/ftp/${user}`, 'PUT', openimmo);
    }

    /**
     * create an openimmo
     * @param openimmo
     */
    async createOpenimmo(openimmo: Openimmo) {
        return await this.invokeApi('/ftp', 'POST', openimmo);
    }

    /**
     * delete an openimmo
     * @param user
     */
    async deleteOpenimmo(user: string) {
        return await this.invokeApi(`/ftp/${user}`, 'DELETE');
    }
}

export default new OpenimmoFtpAccessService();
