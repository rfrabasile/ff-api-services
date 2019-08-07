import { AxiosResponse } from 'axios';
import { APIClient, APIMapping } from '../http';
import { Workflows, Workflow } from '@flowfact/types';

interface WorkflowPatchRequest {
    patches: [{
        id: string;
        patch: [{
            op: string;
            path: string;
            value: string;
        }];
    }];
}

interface WorkflowPatchResult {
    results: [{
        id: string;
        success: boolean;
        error?: {
            type: string;
            description: string;
            additionalInfo: string
        }
    }];
}

class WorkflowService extends APIClient {

    constructor() {
        super(APIMapping.workflowService);
    }

    fetchAvailableConditions = async (): Promise<AxiosResponse<String[]>> => {
        return await this.invokeApi('/action/ids', 'GET', undefined, {
            queryParams: {
                type: 'condition'
            }
        });
    };

    fetchAvailableActions = async (): Promise<AxiosResponse<String[]>> => {
        return await this.invokeApi('/action/ids', 'GET', undefined, {
            queryParams: {
                type: 'action'
            }
        });
    };

    /**
     * Fetch all available templates
     */
    fetchTemplates = async (): Promise<AxiosResponse> => {
        return await this.invokeApi('/flow-type/templates', 'GET');
    };

    /**
     * Fetches a specific workflow
     * @param workflowId
     *  The id of the workflow
     */
    fetchWorkflow = async (workflowId: string): Promise<AxiosResponse<Workflow>> => {
        return await this.invokeApi(`/flow/${workflowId}`, 'GET');
    };

    /**
     * Fetches specific workflows by the ids. If the array is empty, all workflows will be returned.
     * @param workflowIds
     */
    fetchWorkflows = async (workflowIds: string[]): Promise<AxiosResponse<Workflows>> => {
        return await this.invokeApi(`/flow`, 'GET', undefined, {
            queryParams: {
                ids: workflowIds.join(',')
            }
        });
    };

    /**
     * Fetches statistics for the given workflow ids. If the array is empty, it returns all statistics for all workflows
     * @param workflowIds
     */
    fetchWorkflowsStatistics = async (workflowIds: string[]): Promise<AxiosResponse<Workflows>> => {
        return await this.invokeApi(`/flow`, 'GET', undefined, {
            queryParams: {
                stats: true,
                ids: workflowIds.join(',')
            }
        });
    };

    /**
     * Creates a workflow by his name.
     */
    createWorkflow = async (workflow: Workflow): Promise<AxiosResponse<Workflow>> => {
        return await this.invokeApi('/flow', 'POST', workflow);
    };

    /**
     * Updates a workflow by his id.
     * @param workflowId
     * @param workflow
     */
    updateWorkflow = async (workflowId: string, workflow: Workflow): Promise<AxiosResponse<Workflow>> => {
        return await this.invokeApi(`/flow/${workflowId}`, 'PUT', workflow);
    };

    deleteWorkflow = async (workflowId: string): Promise<AxiosResponse> => {
        return await this.invokeApi(`/flow/${workflowId}`, 'DELETE');
    };

    patchWorkflow = async (body: WorkflowPatchRequest): Promise<AxiosResponse<WorkflowPatchResult>> => {
        return await this.invokeApi('/flow', 'PATCH', body);
    };
}

export default new WorkflowService();
