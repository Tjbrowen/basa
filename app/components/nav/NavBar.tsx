import Link from "next/link";
import Container from "../Container";
import { Redressed } from "next/font/google";
import Image from "next/image";

const redressed = Redressed ({subsets: ['latin'], weight: ["400"]});

const NavBar = () => {
    return <div className="
    
    sticky
    top-0
    w-full
    bg-slate-800
    z-30
    shadow-sm
    
    ">
   <div className="py-4 border-b-[1px]">
<Container>
    <div className="
    flex
    items-center
    justify-between
    gap-3
    md:gap-0
    text-slate-200
    ">
    <Link href="/" className={`${redressed.className} font-bold text-2xl`}>
    <Image src="/logo.png" alt="Logo" width={80} height={80} />
</Link>


        <div className="hidden md:block">Search</div>
        <div className="flex items-center gap-8 md:gap-12">
        <div>CartCount</div>
        <div>UserMenu</div>
        </div>
    </div>
</Container>
   </div>
    </div>;
}
 
export default NavBar;