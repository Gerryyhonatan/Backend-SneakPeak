import mongoose from "mongoose";
import * as Yup from "yup";

const Schema = mongoose.Schema;

// DAO = Data Access Object
export const brandDAO = Yup.object({
    name: Yup.string().required(),
    icon: Yup.string().required() 
});

export type Brand = Yup.InferType<typeof brandDAO>;

const BrandSchema = new Schema<Brand>({
    name: {
        type: Schema.Types.String,
        required: true,
    },
    icon: {
        type: Schema.Types.String,
        required: true,
    }
}, {
    timestamps: true
});

const BrandModel = mongoose.model("Brand", BrandSchema);

export default BrandModel;