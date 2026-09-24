import { forwardRef } from "react"

export function CrossSVG() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className=""><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>)
}
export function SearchSVG() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className=""><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
    )
}
export function UpdateSVG() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="scale-100"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
    )
}

const PlayPauseSVG = forwardRef<SVGSVGElement, {}>((props, ref) => {
    return (
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="m-auto scale-200">
            <path style={{ transition: "d 0.2s ease-in-out" }} d=''
                data-pl='M6 3L9 3C9.5 3 10 3.5 10 3L10 20C10 20.5 9.5 21 9 21L6 21C5.5 21 5 20.5 5 20 L5 4C5 3.5 5.5 3 5 3'
                data-pa='M7 3L12 5.5C12 5.5 12 5.5 12 5.5L12 18.5C12 18.5 12 18.5 12 18.5 L7.5 21C6.5 21 6 20 5 20 L5 4.5C5 4 5.5 3 7 3'
            />
            <path style={{ transition: "d 0.2s ease-in-out" }} d=''
                data-pl='M14 3L17 3C17.5 3 18 3.5 18 3L18 20C18 20.5 17.5 21 17 21L14 21C13.5 21 13 20.5 13 20 L13 4C13 3.5 13.5 3 13 3'
                data-pa='M12 5.5L20 10.3C21 10.85 21 10.85 21 12L21 12C21 12.75 21 12.75 20 13.7L12 18.5C12 18.5 12 18.5 12 18.5 L12 5.5C12 5.5 12 5.5 12 5.5'
            />
        </svg>
    )
});
export { PlayPauseSVG };
export function PlusSVG({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={className}><path d="M12 2 L12 22" /><path d="M2 12 L22 12" /></svg>
    )
}
export function RepeatSVG() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="m-auto scale-140"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
    )
}
export function EditSVG() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className=""><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>)
}
export function ListPlusSVG() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className=""><path d="M16 5H3" /><path d="M11 12H3" /><path d="M16 19H3" /><path d="M18 9v6" /><path d="M21 12h-6" /></svg>)
}
export function PropertiesSVG() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className=""><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>)
}

export function ShuffleSVG() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="m-auto scale-140"><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></svg>)
}

const VolSVG = forwardRef<SVGSVGElement, {}>((props, ref) => {
    return (
        <svg stroke-linecap="round" stroke-linejoin="round" stroke-width="2" className="scale-140" stroke="currentColor" ref={ref} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4.70203C10.9998 4.56274 10.9583 4.42663 10.8809 4.31088C10.8034 4.19514 10.6934 4.10493 10.5647 4.05166C10.436 3.99838 10.2944 3.98442 10.1577 4.01154C10.0211 4.03866 9.89559 4.10564 9.797 4.20403L6.413 7.58703C6.2824 7.7184 6.12703 7.82256 5.95589 7.89345C5.78475 7.96435 5.60124 8.00057 5.416 8.00003H3C2.73478 8.00003 2.48043 8.10539 2.29289 8.29292C2.10536 8.48046 2 8.73481 2 9.00003V15C2 15.2652 2.10536 15.5196 2.29289 15.7071C2.48043 15.8947 2.73478 16 3 16H5.416C5.60124 15.9995 5.78475 16.0357 5.95589 16.1066C6.12703 16.1775 6.2824 16.2817 6.413 16.413L9.796 19.797C9.8946 19.8958 10.0203 19.9631 10.1572 19.9904C10.2941 20.0177 10.436 20.0037 10.5649 19.9503C10.6939 19.8968 10.804 19.8063 10.8815 19.6902C10.959 19.5741 11.0002 19.4376 11 19.298V4.70203Z" />
            <path style={{ transition: "d 0.4s ease-in-out" }} d="M16 9C16.6491 9.86548 17 10.9181 17 12C17 13.0819 16.6491 14.1345 16 15"
                data-v2="M16 9C16.6491 9.86548 17 10.9181 17 12C17 13.0819 16.6491 14.1345 16 15"
                data-v1="M16 9C16.6491 9.86548 17 10.9181 17 12C17 13.0819 16.6491 14.1345 16 15"
                data-v0="M11 9C11 9 11 11 11 12C11 13 11 13 11 15"
                data-vn="M16.5 9.5C16.5 9.5 19 12 19 12C19 12 16.5 14.5 16.5 14.5" />
            <path style={{ transition: "d 0.4s ease-in-out" }} d="M19.364 18.364C20.1998 17.5283 20.8627 16.5361 21.315 15.4442C21.7673 14.3522 22.0001 13.1819 22.0001 12C22.0001 10.8181 21.7673 9.64775 21.315 8.55581C20.8627 7.46387 20.1998 6.47172 19.364 5.63599"
                data-v2="M19.364 18.364C20.1998 17.5283 20.8627 16.5361 21.315 15.4442C21.7673 14.3522 22.0001 13.1819 22.0001 12C22.0001 10.8181 21.7673 9.64775 21.315 8.55581C20.8627 7.46387 20.1998 6.47172 19.364 5.63599"
                data-v1="M16 15 C16.84 14.16 17 13.8 17 12.5C17 12.5 17 12.5 17 12C17 11.5 17 10.8 17 10.8C17 10.8 16.84 9.8 16 9"
                data-v0="M11 15 C11 14.16 11 13.8 11 12.5C11 12.5 11 12.5 11 12C11 11.5 11 10.8 11 10.8C11 10.8 11 9.8 11 9"
                data-vn="M21.5 9.5 C21.5 9.5 21 10 21 10C21 10 19 12 19 12C19 12 21 14 21 14C21 14 21.5 14.5 21.5 14.5" />
        </svg>
    )
});
export { VolSVG };
