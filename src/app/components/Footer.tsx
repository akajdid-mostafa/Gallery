import React from 'react';
// import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 item-center mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">&copy; 2025 Gallery Control. All rights reserved.</p>
          </div>
          {/* <div className="flex space-x-4">
            <p className="text-gray-600">&copy; 2025 Gallery Control. All rights reserved.</p>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

