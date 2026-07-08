import ShopDropDown from "./Shop";
import MegaMenu from "./MegaMenu";
import Links from "./Links";

export default function Nav() {
    const links = [
        {
            href: `/shop?category=new-drops`,
            text: `New Drops`
        },
        {
            href: `/shop?category=nike-shoes`,
            text: `Nike Shoes`
        },
        {
            href: `/shop?category=special-offer`,
            text: `% Special Offer`
        },

    ]

    return (
        <div className="bg-[#f7f5f5] border-b border-gray-300 w-full h-full py-4 max-md:hidden relative">
            <div className="mx-auto h-full w-full  2xl:max-w-[1500px] pl-5 pr-5 md:pl-10 md:pr-10">
                <div className='flexCenter w-full'>
                    <div className="flexCenter gap-3 lg:gap-7">
                        <ShopDropDown megaMenuContent={<MegaMenu />} />
                        {
                            links.map((link,index) => (
                                <Links key={link.href} index={index} href={link.href} text={link.text} />
                            ))
                        }
                    </div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
    )
}
