import { ethers } from "ethers";
import NftCard from "../components/NftCard";
import Layout from "../components/Layout";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../engine/config";
import { useEffect, useState } from "react";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NotListed from "../components/NotListed";

export default function Home() {
  const [data, setData] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [message, updateMessage] = useState("");

  useEffect(() => {
    getAllNFTs();
  }, []);
  async function getAllNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    const data = await contract.getAllNFTs();

    const items = await Promise.all(
      data.map(async i => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
         
        };
        return item;
      })
    );

    setData(items);
    setLoadingState("loaded");
  }

  async function buyNFT(tokenId) {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      //sign the transaction
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );

      //set the price
      const price = ethers.utils.parseUnits(tokenId.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");

      //make the sale
      const transaction = await contract.executeSale(tokenId, {
        value: (price),
      });
      await transaction.wait();
      alert("You successfully bought the NFT!");
      updateMessage("");
      loadNFTs();
    } catch (error) {
      alert("Purchase Error" + error);
    }
  }

  // async function buyNFT(tokenId) {
  //   try {
  //     const ethers = require("ethers");
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     let contract = new ethers.Contract(
  //       nftmarketaddress.address,
  //       Market.abi,
  //       signer
  //     );
  //     const salePrice = ethers.utils.parseUnits(data.price, "ether");
  //     updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
  //     let transaction = await contract.executeSale(tokenId, {
  //       value: salePrice,
  //     });
  //     await transaction.wait();

  //     alert("You successfully bought the NFT!");
  //     updateMessage("");
  //   } catch (e) {
  //     alert("Upload Error" + e);
  //   }
  // }

  if (loadingState === "loaded" && !data.length) return <NotListed />;

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:grid-cols-2 pt-20">
        {data.map((nft, index) => (
          <NftCard nft={nft} key={index} buyNFT={buyNFT}></NftCard>
        ))}
      </div>
    </Layout>
  );
}
