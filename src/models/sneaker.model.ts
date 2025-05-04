import mongoose, { ObjectId } from "mongoose";
import * as Yup from "yup";

const Schema = mongoose.Schema;

export const sneakerDAO = Yup.object({
   name: Yup.string().required(),
   description: Yup.string().required(),
   price: Yup.number().required(),
   image: Yup.string().required(),
   isReady: Yup.boolean().required(),
   brand: Yup.string().required(),
   category: Yup.string().required(),
   slug: Yup.string(),
   createdBy: Yup.string().required(),
   createdAt: Yup.string(),
   updatedAt: Yup.string() 
});

export type TypeSneaker = Yup.InferType<typeof sneakerDAO>

export interface Sneaker extends Omit<TypeSneaker, "category" | "brand" | "createdBy"> {
    category: ObjectId;
    brand: ObjectId;
    createdBy: ObjectId;
}

const SneakerSchema = new Schema<Sneaker>({
    name: {
        type: Schema.Types.String, 
        required: true
    },
    description: {
        type: Schema.Types.String, 
        required: true
    },
    price: {
        type: Schema.Types.Number, 
        required: true
    },
    image: {
        type: Schema.Types.String, 
        required: true
    },
    isReady: {
        type: Schema.Types.Boolean, 
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId, 
        required: true,
        ref: "Brand"
    },
    category: {
        type: Schema.Types.ObjectId, 
        required: true,
        ref: "Category"
    },
    slug: {
        type: Schema.Types.String, 
        unique: true
    },
    createdBy: {
        type: Schema.Types.String, 
        required: true,
        ref: "User"
    },
    createdAt: {
        type: Schema.Types.String
    },
    updatedAt: {
        type: Schema.Types.String
    }
}, {
    timestamps: true
});

SneakerSchema.pre("save", function() {
    if(!this.slug) {
        const slug = this.name.split(" ").join("-").toLowerCase()
        this.slug = `${slug}`
    }
});

const SneakerModel = mongoose.model("Sneaker", SneakerSchema);

export default SneakerModel;