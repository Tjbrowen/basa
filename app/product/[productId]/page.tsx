import Container from "@/app/components/Container";
import { product } from "@/utils/product";
import { dividerClasses } from "@mui/material";
import ProductDetails from "./ProductDetails";
import ListRating from "./ListRating";
interface IPrams {
    productId?: string 
}
const Product = ({params} : {params: IPrams}) => {
    product
    return (  <div className="p-8">
        <Container>
            <ProductDetails product = {product}/>
            <div>
                <div>
                    Add Rating
                </div>
                <div className="flex flex-col mt-20 gap-4">
                    <ListRating product={product}/>
                    <div className="">

                    </div>
                </div>
            </div>
        </Container>
         </div>);
}
 
export default Product;