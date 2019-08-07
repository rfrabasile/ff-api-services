import { AxiosResponse } from 'axios';
import { APIClient, APIMapping } from '../http';

export class SchemaService extends APIClient {
    constructor() {
        super(APIMapping.schemaService);
    }

    /**
     * TODO: Please comment this method
     * @param withGroups
     */
    async loadStats(withGroups: boolean = false): Promise<AxiosResponse> {
        const additionalParams = withGroups ? { queryParams: { groups: 'true' } } : undefined;
        return await this.invokeApi('/stats', 'GET', undefined, additionalParams);
    }

    /**
     * TODO: Please comment this method
     * @param withGroups
     * @param short
     */
    async fetchAllSchemas(withGroups: boolean = false, short: boolean = false): Promise<AxiosResponse> {
        let queryParams: any = {
            transform: true
        };

        if (withGroups) {
            queryParams.groups = 'true';
        }

        if (short) {
            queryParams.short = 'true';
        }

        return this.invokeApi('/schemas', 'GET', undefined, { queryParams });
    }

    /**
     * TODO: Please comment this method
     * @param schemaId
     * @param page
     * @param size
     */
    async fetchDataBySchemaId(schemaId: string, page: number = 1, size?: number): Promise<AxiosResponse> {
        let queryParams: any = {
            page: page.toString(),
        };
        if (size) {
            queryParams.size = size.toString();
        }
        return this.invokeApi(`/data/${schemaId}`, 'GET', undefined, { queryParams });
    }

    /**
     * @deprecated Please use SchemaServiceV2.fetchSchemaByIdOrName
     * Retrieves a schema by schemaId
     * @param schemaId
     * @param queryParams
     */
    async fetchSchema(schemaId: string, queryParams: any = {}): Promise<AxiosResponse> {
        queryParams.transform = true;
        return this.invokeApi(`/schemas/${schemaId}`, 'GET', undefined, { queryParams });
    }

    /**
     * @deprecated Please use SchemaServiceV2.createSchema
     * Creates a schema
     * @param schema
     */
    async createSchema(schema: any): Promise<AxiosResponse> {
        return this.invokeApi('/schemas?transform=true', 'POST', schema);
    }

    /**
     * @deprecated Please use SchemaServiceV2.deleteSchema
     * Deletes a schema
     * @param schemaId
     */
    async deleteSchema(schemaId: string): Promise<AxiosResponse> {
        return this.invokeApi(`/schemas/${schemaId}`, 'DELETE');
    }

    /**
     * @deprecated Please use SchemaServiceV2.deleteAllSchema
     * deletes all groups and schemas
     * @constructor
     * @param {string} key - if you are sure you want delete all schemas then set key = DELETE
     */
    async deleteAllSchema(key: string): Promise<AxiosResponse> {
        if (!key || key !== 'DELETE') {
            return Promise.reject('you need to set key = DELETE if you are sure you want delete all schemas');
        }
        return this.invokeApi(`/schemas/deleteAll?key=${key}`, 'DELETE');
    }

    /**
     * @deprecated Please use SchemaServiceV2.updateSchema
     * Updates a schema
     * @param schema
     */
    async updateSchema(schema: any): Promise<AxiosResponse> {
        return this.invokeApi(`/schemas/${schema.id}?transform=true`, 'PUT', schema);
    }

    /**
     * Fetchs a transformed integration by his id.
     * @param integrationId
     */
    async fetchIntegration(integrationId: string): Promise<AxiosResponse> {
        return this.invokeApi(`/integrations/${integrationId}`, 'GET', undefined, {
            queryParams: {
                transform: true
            }
        });
    }

    /**
     * TODO: Please comment this method
     * @param schemaId
     */
    async fetchIntegrationsForSchema(schemaId: string): Promise<AxiosResponse> {
        return this.invokeApi(`/integrations?schemaId=${schemaId}&transform=true`, 'GET');
    }

    /**
     * TODO: Please comment this method
     * @param schemaId
     * @param label
     */
    async createIntegrationForSchema(schemaId: string, label: string): Promise<AxiosResponse> {
        const integration = {
            schemaId: schemaId,
            label: label
        };
        return this.invokeApi('/integrations?transform=true', 'POST', integration);
    }

    /**
     * This updates just the formData of an integration
     * @param integrationId
     * @param data
     */
    async updateIntegrationFormData(integrationId: string, data: any): Promise<AxiosResponse> {
        return this.invokeApi(`/integrations/${integrationId}/formdata?transform=true`, 'POST', data);
    }

    /**
     * This updates the whole integration
     * @param integrationId
     * @param data
     */
    async updateIntegration(integrationId: string, data: any): Promise<AxiosResponse> {
        return this.invokeApi(`/integrations/${integrationId}`, 'PUT', data);
    }

    /**
     * Delete an integration by the representing id.
     * @param integrationId
     */
    async deleteIntegration(integrationId: string): Promise<AxiosResponse> {
        return this.invokeApi(`/integrations/${integrationId}`, 'DELETE');
    }

    /**
     * TODO: Please comment this method
     * @param url
     */
    async fetchResponseForIntegrationGetUrlByUrl(url: string): Promise<AxiosResponse> {
        return this.invokeApi(url, 'GET');
    }

    /**
     * TODO: Please comment this method
     * @param integrationId
     */
    async fetchResponseForIntegrationGetUrlById(integrationId: string): Promise<AxiosResponse> {
        return this.invokeApi(`/integrations/${integrationId}/data`, 'GET');
    }

    /**
     * @deprecated Please use SchemaServiceV2.fetchAllSchemas and pass in the group's name to filter
     * Retrieves all members (schemas) of a given groupId
     * @param groupId
     */
    async fetchAllMembersOfGroup(groupId: string): Promise<AxiosResponse> {
        return this.invokeApi(`/groups/${groupId}/members`, 'GET');
    }
}

export default new SchemaService();
