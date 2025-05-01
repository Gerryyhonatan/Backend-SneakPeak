import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import CategoryModel, { categoryDAO } from "../models/category.model";
import response from "../utils/response";
import { isValidObjectId } from "mongoose";

export default {
    async create(req: IReqUser, res: Response) {
        try {
            await categoryDAO.validate(req.body);
            const result = await CategoryModel.create(req.body);
            response.success(res, result, "Success create category")
        } catch (error) {
            response.error(res, error, "Failed create category")
        }
    },

    async findAll(req: IReqUser, res: Response) {
        try {
            const {page = 1, limit = 10, search} = req.query as unknown as IPaginationQuery;
            const query = {};

            if(search) {
                Object.assign(query, {
                    $or : [
                        {
                            name: {$regex: search, $options: "i"}
                        },
                        {
                            description: {$regex: search, $options: "i"}
                        }
                    ]
                })
            }

            const result = await CategoryModel.find(query).limit(limit).skip((page - 1) * limit).sort({createdAt: -1}).exec();

            const count = await CategoryModel.countDocuments(query);

            response.pagination(res, result, {
                total: count,
                totalPages: Math.ceil(count / limit),
                current: page
            }, "Success find all category")

        } catch (error) {
            response.error(res, error, "Failed get categories")
        }
    },

    async findOne(req: IReqUser, res: Response) {
        try {
            const { id } = req.params
            
            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed find one category")
            }
            
            const result = await CategoryModel.findById(id)
            
            if(!result) {
                return response.notFound(res, "Failed find one category")
            }

            response.success(res, result, "Succes find one category")
        } catch (error) {
            response.error(res, error, "Failed get category")
        }
    },

    async update(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed update a category")
            }

            const result = await CategoryModel.findByIdAndUpdate(id, req.body, {
                new: true,
            })
            response.success(res, result, "Succes update a category")
        } catch (error) {
            response.error(res, error, "Failed update category")
        }
    },

    async remove(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, "Failed remove a banner")
            }

            const result = await CategoryModel.findByIdAndDelete(id, {
                new: true
            })
            response.success(res, result, "Succes remove category")
        } catch (error) {
            response.error(res, error, "Failed delete category")
        }
    },
};