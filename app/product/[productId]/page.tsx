import Container from "@/app/components/Container";
import { dividerClasses } from "@mui/material";
import ProductDetails from "./ProductDetails";
import ListRating from "./ListRating";
import { products } from "@/utils/proucts";

interface IPrams {
    productId?: string 
}
const Product = ({params} : {params: IPrams}) => {

const product = products.find((item) => item.id ===
params.productId)

   
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