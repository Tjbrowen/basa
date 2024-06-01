"use client"

import React from "react";
import { CartProductType } from "../product/[productId]/ProductDetails";
import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";

interface ItemContentProps{
    item: CartProductType
}

const ItemContent: React.FC<ItemContentProps> = ({item}) => {
    return ( 

        <div className="
        grid
        grid-cols-5
        text-xs
        md:text-4
        border-t-[1.5px]
        border-slate-200
        py-4
        items-center
        ">
         <div className="
         cols-span-2
         justify-self-start
         flex
         gap-2
         md: ap-4
         ">
          <Link href={`product/${item.id}`}>
            <div></div>
          </Link>
         </div>
         <div>{formatPrice(item.price)}</div>
         <div></div>
         <div></div>
        </div>
     );
}
 
export default ItemContent;