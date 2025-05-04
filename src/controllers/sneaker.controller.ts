import {Response} from "express";
import {IReqUser} from "../utils/interfaces";
import response from "../utils/response";
import SneakerModel, { sneakerDAO, TypeSneaker } from "../models/sneaker.model";
import { FilterQuery, isValidObjectId } from "mongoose";
import uploader from "../utils/uploader";


export default {
    async create(req: IReqUser, res: Response) {
        try {
            const payload = {...req.body, createdBy: req.user?.id} as TypeSneaker;
            await sneakerDAO.validate(payload);
            const result = await SneakerModel.create(payload);
            response.success(res, result, "Success create a product")
        } catch (error) {
            response.error(res, error, "Failed to create a product")
        }
    },

    async findAll(req: IReqUser, res: Response) {
        try {
            const buildQuery = (filter: any) => {
                let query: FilterQuery<TypeSneaker> = {}

                if(filter.search) query.$text = {$search : filter.search};
                if(filter.category) query.category = filter.category;
                if(filter.isReady) query.isReady = filter.isReady;
                if(filter.brand) query.brand = filter.brand;

                return query;
            }

            const { limit = 10, page = 1, search, category, isReady, brand } = req.query;

            const query = buildQuery({
                search,
                category,
                isReady,
                brand
            })

            const result = await SneakerModel.find(query).limit(+limit).skip((+page - 1) * +limit).sort({createdAt: -1}).lean().exec()
            const count = await SneakerModel.countDocuments(query)

            response.pagination(res, result, {
                current: +page,
                total: count,
                totalPages: Math.ceil(count / +limit),
            }, "Success find all products")
        } catch (error) {
            response.error(res, error, "Failed to get products")
        }
    },

    async findOne(req: IReqUser, res: Response) {
        try {
            const {id} = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed find one product")
            }

            const result = await SneakerModel.findById(id);

            if(!result) {
                return response.notFound(res, "Failed find one product")
            }

            response.success(res, result, "Succes find one product")
        } catch (error) {
            response.error(res, error, "Failed to get product")
        }
    },

    async update(req: IReqUser, res: Response) {
        try {
            const {id} = req.params;
            const result = await SneakerModel.findByIdAndUpdate(id, req.body, {
                new: true,
            })

            if(!result) return response.notFound(res, "Product not found");

            response.success(res, result, "Succes update a product")
        } catch (error) {
            response.error(res, error, "Failed to update product")
        }
    },

    async remove(req: IReqUser, res: Response) {
        try {
            const {id} = req.params;
            const result = await SneakerModel.findByIdAndDelete(id, {
                new: true,
            })

            if(!result) return response.notFound(res, "Product not found");

            await uploader.remove(result.image);

            response.success(res, result, "Succes delete a product")
        } catch (error) {
            response.error(res, error, "Failed to delete product")
        }
    },

    async findOneBySlug(req: IReqUser, res: Response) {
        try {
            const {slug} = req.params;
            const result = await SneakerModel.findOne({slug});

            if(!result) return response.notFound(res, "Product not found");

            response.success(res, result, "Succes get product by slug")
        } catch (error) {
            response.error(res, error, "Failed to get product by slug")
        }
    }

}