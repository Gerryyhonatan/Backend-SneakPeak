import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import BrandModel, { brandDAO } from "../models/brand.model";
import response from "../utils/response";
import { isValidObjectId } from "mongoose";

export default {
    async create(req: IReqUser, res: Response) {
        try {
            await brandDAO.validate(req.body);
            const result = await BrandModel.create(req.body);
            response.success(res, result, "Success create brand")
        } catch (error) {
            response.error(res, error, "Failed create brand")
        }
    },

    async findAll(req: IReqUser, res: Response) {
        try {
            const {page = 1, limit = 10, search} = req.query as unknown as IPaginationQuery;
            const query = {};

            if(search) {
                Object.assign(query, { name: {$regex: search, $options: "i"}})
            }

            const result = await BrandModel.find(query).limit(limit).skip((page - 1) * limit).sort({createdAt: -1}).exec();

            const count = await BrandModel.countDocuments(query);

            response.pagination(res, result, {
                total: count,
                totalPages: Math.ceil(count / limit),
                current: page
            }, "Success find all brands")

        } catch (error) {
            response.error(res, error, "Failed get brands")
        }
    },

    async findOne(req: IReqUser, res: Response) {
        try {
            const {id} = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed find one brand")
            }

            const result = await BrandModel.findById(id);

            if(!result) {
                return response.notFound(res, "Failed find one brand")
            }

            response.success(res, result, "Succes find one brand")

        } catch (error) {
            response.error(res, error, "Failed get brand")
        }
    },

    async update(req: IReqUser, res: Response) {
        try {
            const {id} = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed update brand")
            }

            const result = await BrandModel.findByIdAndUpdate(id, req.body, {
                new: true,
            })
            response.success(res, result, "Succes update brand")
        } catch (error) {
            response.error(res, error, "Failed update brand")
        }
    },

    async remove(req: IReqUser, res: Response) {
        try {
            const {id} = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed delete brand")
            }

            const result = await BrandModel.findByIdAndDelete(id, {
                new: true
            })
            response.success(res, result, "Succes delete brand")
        } catch (error) {
            response.error(res, error, "Failed delete brand")
        }
    },
};