import Link from 'next/link';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
        <div className="main_wrapper">
            <div className="main">
                <div className="antenna">
                    <div className="antenna_shadow"></div>
                    <div className="a1"></div>
                    <div className="a1d"></div>
                    <div className="a2"></div>
                    <div className="a2d"></div>
                </div>
                <div className="tv">
                    <div className="curve_svg">
                    <svg
                        viewBox="0 0 189 217" version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Page-1" transform="translate(-616.000000, -291.000000)">
                            <g id="Artboard-1" transform="translate(8.000000, 11.000000)">
                            <g id="Curve" transform="translate(608.000000, 280.000000)">
                                <path d="M28.18,3.42 C28.18,3.42 28.18,10.12 28.18,10.12 C28.18,10.12 28.18,217.00 28.18,217.00 C28.18,217.00 28.18,217.00 28.18,217.00 C28.18,217.00 188.00,217.00 188.00,217.00 C188.00,217.00 188.00,10.12 188.00,10.12 C188.00,10.12 188.00,3.42 188.00,3.42 C188.00,3.42 188.00,3.42 188.00,3.42 C188.00,3.42 28.18,3.42 28.18,3.42 Z" fill="#1D0E01"></path>
                                <path d="M187.00,2.42 C187.00,2.42 27.18,2.42 27.18,2.42 C27.18,2.42 27.18,2.42 27.18,2.42 C27.18,2.42 27.18,9.12 27.18,9.12 C27.18,9.12 187.00,9.12 187.00,9.12 C187.00,9.12 187.00,2.42 187.00,2.42 Z" fill="#341901"></path>
                                <path d="M27.18,216.00 C27.18,216.00 187.00,216.00 187.00,216.00 C187.00,216.00 187.00,209.30 187.00,209.30 C187.00,209.30 27.18,209.30 27.18,209.30 C27.18,209.30 27.18,216.00 27.18,216.00 Z" fill="#341901"></path>
                                <path d="M28,3 C28,3 28,216 28,216 C28,216 28,216 28,216 C28,216 29,216 29,216 C29,216 29,3 29,3 L28,3 Z" fill="#E69635"></path>
                                <path d="M188,3 L187,3 L187,216 L188,216 L188,3 Z" fill="#E69635"></path>
                            </g>
                            </g>
                        </g>
                        </g>
                    </svg>
                    </div>
                    <div className="display_div">
                    <div className="screen_out">
                        <div className="screen_out1">
                        <div className="screen">
                            <span className="notfound_text"> Sidan Hittades Inte</span>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="lines">
                        <div className="line1"></div>
                        <div className="line2"></div>
                        <div className="line3"></div>
                    </div>
                    <div className="buttons_div">
                        <div className="b1"><div></div></div>
                        <div className="b2"></div>
                        <div className="speakers">
                            <div className="g1"><div className="g11"></div><div className="g12"></div><div className="g13"></div></div>
                            <div className="g"></div>
                            <div className="g"></div>
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <div className="base1"></div>
                    <div className="base2"></div>
                    <div className="base3"></div>
                </div>
            </div>
            <div className="text_404">
                <div className="text_4041">4</div>
                <div className="text_4042">0</div>
                <div className="text_4043">4</div>
            </div>
        </div>
         <Link href="/" className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Gå tillbaka till startsidan
        </Link>
    </div>
  );
}
