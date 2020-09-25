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

    collectionName(): string {
        return this.model.collection.name;
    }

    aggregate(aggregations?: any[]) {
        return this.model.aggregate(aggregations);
    }
    find(conditions: FilterQuery<T>) {
        return this.model.find(conditions);
    }
    findOne(conditions: FilterQuery<T>) {
        return this.model.findOne(conditions);
    }
    findOneAndUpdate(conditions: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryFindOneAndUpdateOptions) {
        return this.model.findOneAndUpdate(conditions, update, options);
    }
    findOneAndUpdateRaw(
        conditions: FilterQuery<T>,
        update: UpdateQuery<T>,
        options?: { rawResult: true } & QueryFindOneAndUpdateOptions,
    ) {
        return this.model.findOneAndUpdate(conditions, update, options);
    }
    exists(filter: FilterQuery<T>) {
        return this.model.exists(filter);
    }
    countDocuments(criteria?: FilterQuery<T>) {
        return this.model.countDocuments(criteria);
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
