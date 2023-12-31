/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";

const NftCard = ({ nft, buyNFT }) => {
  return (
    <div className=" pt-5 ">
      <div className="w-full px-4 lg:px-0">
        <div className="mt-[1px]   bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <Link href="#">
            <img
              className="rounded-t-lg"
              height="100px"
              src={nft.image}
              alt="image"
            />
          </Link>
          <div className="p-5">
            <a href="#">
              <h2 className="mb-2 text-1xl font-bold tracking-tight text-gray-900 dark:text-white">
                {nft.name || "name of item"}
              </h2>
            </a>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              {nft.description || 'description'}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {nft.price || "price of item"} ETH
              </span>
              <button onClick={() => buyNFT(nft)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Buy NFT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftCard;
