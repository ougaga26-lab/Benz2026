import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mercedes-Benz | 華山探索體驗',description:'六站探索，三章成禮。華山新車探索體驗。',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-Hant" className="dark"><body>{children}</body></html>}
