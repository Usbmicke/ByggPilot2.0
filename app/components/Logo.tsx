import Image from 'next/image';

const Logo = () => {
  return (
    <div className="flex items-center">
      <Image src="/byggpilot-logo.png" alt="ByggPilot Logo" width={40} height={40} />
      <span className="ml-2 text-xl font-semibold text-gray-900">ByggPilot</span>
    </div>
  );
};

export default Logo;
