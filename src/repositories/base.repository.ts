import {
    FilterQuery,
    Model,
    Document,
    UpdateQuery,
    CreateQuery,
    QueryFindOneAndUpdateOptions,
    SaveOptions,
} from 'mongoose';

class BaseRepository<T extends Document> {
    protected model: Model<T>;

    find(conditions: FilterQuery<T>) {
        return this.model.find(conditions);
    }
    findOneAndUpdate(conditions: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryFindOneAndUpdateOptions) {
        return this.model.findOneAndUpdate(conditions, update, options);
    }
    exists(filter: FilterQuery<T>) {
        return this.model.exists(filter);
    }
    createOne<TCreate = T>(doc: CreateQuery<T>, options?: SaveOptions) {
        return this.model.create(doc, options);
    }
    createMultiple<TCreate = T>(doc: CreateQuery<T>[], options?: SaveOptions) {
        return this.model.create(doc, options);
    }
    remove(conditions: FilterQuery<T>) {
        return this.model.remove(conditions);
    }
}

export default BaseRepository;
