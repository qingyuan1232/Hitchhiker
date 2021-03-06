import { CollectionService } from '../services/collection_service';
import { UserCollectionService } from '../services/user_collection_service';
import { GET, POST, PUT, DELETE, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../interfaces/res_object';
import * as Koa from 'koa';
import { DtoCollection } from '../common/interfaces/dto_collection';
import { SessionService } from '../services/session_service';
import { Message } from '../utils/message';
import * as _ from 'lodash';
import { RecordService } from '../services/record_service';
import { DtoRecord } from '../common/interfaces/dto_record';
import { Importer } from '../services/base/request_import';

export default class CollectionController extends BaseController {

    @GET('/collections')
    async getCollections(ctx: Koa.Context): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        const { collections, recordsList } = await UserCollectionService.getUserCollections(userId);
        let records: _.Dictionary<_.Dictionary<DtoRecord>> = {};
        _.keys(recordsList).forEach(k => records[k] = _.chain(recordsList[k]).map(r => RecordService.toDto(r)).keyBy('id').value());
        return {
            success: true,
            message: 'fetch collections success',
            result: {
                collections: _.keyBy<DtoCollection>(collections.map(c => CollectionService.toDto(c)), 'id'),
                records
            }
        };
    }

    @POST('/collection')
    async create(ctx: Koa.Context, @BodyParam collection: DtoCollection): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        return await CollectionService.create(collection, userId);
    }

    @PUT('/collection')
    async update(@BodyParam collection: DtoCollection): Promise<ResObject> {
        return await CollectionService.update(collection);
    }

    @DELETE('/collection/:id')
    async delete(@PathParam('id') id: string): Promise<ResObject> {
        return await CollectionService.delete(id);
    }

    @GET('/collection/share/:collectionid/to/:projectid')
    async share(@PathParam('collectionid') collectionId: string, @PathParam('projectid') projectId: string): Promise<ResObject> {
        return await CollectionService.shareCollection(collectionId, projectId);
    }

    @POST('/collection/:projectid')
    async importFromPostman(ctx: Koa.Context, @PathParam('projectid') projectId: string, @BodyParam info: any): Promise<ResObject> {
        const user = SessionService.getUser(ctx);
        await Importer.do(info, projectId, user);
        return { success: true, message: Message.get('importPostmanSuccess') };
    }
}