import { DslBuilder } from '@flowfact/node-flowdsl';
import {
    EntityIdCondition,
    Flowdsl,
    FlowdslConditionUnion,
    HasFieldWithValueCondition,
} from '@flowfact/node-flowdsl/lib/Flowdsl';
import { Entity, FilterConfiguration } from '@flowfact/types';
import { AxiosResponse } from 'axios';
import { APIClient, APIMapping } from '../http';
import { SearchResult } from '..';

export class SearchService extends APIClient {

    constructor() {
        super(APIMapping.searchService);
    }

    /**
     * Get all searches as short searches. Just the ID and the Name of the search
     * will be returned in a array.
     */
    async fetchSearches(): Promise<AxiosResponse> {
        return await this.invokeApi('/search', 'GET');
    }

    /**
     * Get the full search information by id.
     */
    async fetchSearch(searchId: string) {
        return await this.invokeApi(`/search/${searchId}`, 'GET');
    }

    /**
     * TODO: Please comment this method
     * @param searchModel
     */
    async saveSearch(searchModel: any) {
        return await this.invokeApi('/search', 'POST', searchModel);
    }

    /**
     * TODO: Please comment this method
     * @param searchId
     */
    async deleteSearch(searchId: string) {
        return await this.invokeApi(`/search/${searchId}`, 'DELETE');
    }

    /**
     * TODO: Please comment this method
     * @param searchId
     * @param searchModel
     */
    async updateSearch(searchId: string, searchModel: any) {
        return await this.invokeApi(`/search/${searchId}`, 'PUT', searchModel);
    }

    /**
     * This method searches for entities or tags. See swagger documentation of search-service for details
     * @param query
     * @param index
     * @param page
     * @param size
     * @param withCount
     */
    async search(query: Flowdsl, index: string, page: number = 1, size?: number, withCount?: boolean) {
        let queryParams: any = {};
        if (page) {
            queryParams.page = page;
        }
        if (size) {
            queryParams.size = size;
        }
        if (withCount) {
            queryParams.withCount = withCount;
        }

        return await this.invokeApi<SearchResult<Entity>>('/schemas/' + index, 'POST', query, {
            queryParams: queryParams,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * TODO: Please comment this method
     * @param query
     * @param index
     */
    async count(query: Flowdsl, index: string) {
        return await this.invokeApi('/schemas/' + index + '/count', 'POST', query, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * TODO: Please comment this method
     * @param index
     * @param page
     * @param size
     * @param filter
     * @param sorting
     */
    async filter(index: string, page: number = 1, size: number = 30, filter: FilterConfiguration, sorting: any) {
        let queryParams: any = {};
        if (page) {
            // page -1 because the the pages start at 0 on the backend
            queryParams.page = page;
        }
        if (size) {
            queryParams.size = size;
        }

        return await this.invokeApi<SearchResult<Entity>>('/schemas/' + index, 'POST', this.buildQuery(filter, sorting), {
            queryParams: queryParams,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    buildQuery(filterConfiguration: FilterConfiguration, sorting: any): Flowdsl {
        const builder = new DslBuilder();
        builder.target('ENTITY');
        builder.distinct(false);

        if (filterConfiguration) {
            if (filterConfiguration.value && filterConfiguration.value !== '') {
                const conditions: FlowdslConditionUnion[] = filterConfiguration.fields.map(field => {
                    if (field === 'id') {
                        return {
                            type: 'ENTITYID',
                            values: [filterConfiguration.value],
                        } as EntityIdCondition;
                    }
                    return {
                        type: 'HASFIELDWITHVALUE',
                        field: field,
                        value: filterConfiguration.value,
                        operator: 'LIKE',
                    } as HasFieldWithValueCondition;
                });

                builder.withCondition({
                    type: 'OR',
                    conditions: conditions,
                });
            }

            if (filterConfiguration.limitResponse) {
                builder.fetch(filterConfiguration.fields);
            }
        }

        if (sorting) {
            // don't do anything right now, because the flowdsl doesn't support sorting.
        }

        return builder.build();
    }
}

export default new SearchService();
