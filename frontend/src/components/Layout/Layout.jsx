import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout({ children, onSearch }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans">
      <Header onSearch={onSearch} />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
