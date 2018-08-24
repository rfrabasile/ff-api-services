import {APIClient, APIMapping} from '../http';
import {AxiosResponse} from 'axios';

export class ContactService extends APIClient {

    constructor() {
        super(APIMapping.contactService);
    }


    getContactByEmail(email: string): Promise<AxiosResponse> {
        return this.invokeApi('/contact', 'GET', undefined, {queryParams: {email}});
    }
}

export default new ContactService();