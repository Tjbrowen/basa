import Container from "@/app/components/Container";
import { product } from "@/utils/product";
import { dividerClasses } from "@mui/material";
import ProductDetails from "./ProductDetails";
interface IPrams {
    productId?: string 
}
const Product = ({params} : {params: IPrams}) => {
    product
    return (  <div className="p-8">
        <Container>
            <ProductDetails product = {product}/>
        </Container>
         </div>);
}
 
export default Product;