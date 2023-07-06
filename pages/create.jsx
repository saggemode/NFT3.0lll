import React from "react";
import Layout from "../components/Layout";
import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { nftaddress, nftmarketaddress } from "../engine/config";
import { uploadFileToIPFS, uploadJSONToIPFS } from '../pinata'

const Create = () => {
  const [fileUrl, setFileUrl] = useState(null)
  const [message, updateMessage] = useState('');
  const [formInput, updateFormInput] = useState({price: '', name: '', description:''})
  const router = useRouter();

  async function OnChangeFile(e) {
      const file = e.target.files[0]
      try{            
          const response = await uploadFileToIPFS(file);
          if(response.success === true) {
              console.log("Uploaded image to Pinata: ", response.pinataURL)
              setFileUrl(response.pinataURL);
          }
      }
      catch(e) {
          console.log("Error during file upload", e);
      }
  }

  //1. create item (image/video) and upload to ipfs
  async function uploadMetadataToIPFS(){
      const {name, description, price} = formInput; //get the value from the form input
      
      //form validation
      if(!name || !description || !price || !fileUrl) {
          return
      }

      const nftJSON = JSON.stringify({
          name, description, image: fileUrl
      });

      try {
          //upload the metadata JSON to IPFS
          const response = await uploadJSONToIPFS(nftJSON);
          if(response.success === true){
              console.log("Uploaded JSON to Pinata: ", response)
              return response.pinataURL;
          }
      }
      catch(e) {
          console.log("error uploading JSON metadata:", e)
      }
  }

  async function createSale(e) {
      e.preventDefault();

      //Upload data to IPFS
      try {
          const metadataURL = await uploadMetadataToIPFS();
          const web3Modal = new Web3Modal();
          const connection = await web3Modal.connect();
          const provider = new ethers.providers.Web3Provider(connection);
         
const signer = provider.getSigner();
          updateMessage("Please wait.. uploading (upto 5 mins)")

          let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
          const price = ethers.utils.parseUnits(formInput.price, 'ether')
          let listingPrice = await contract.getListPrice()
          listingPrice = listingPrice.toString()

          //actually create the NFT
          let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
          await transaction.wait()

          alert("Successfully listed your NFT!");
          updateMessage("");
          updateFormInput({ name: '', description: '', price: ''});
          router.push('/')
      }
      catch(e) {
          alert( "Upload error"+e )
      }
  }
  return (
    <Layout>
      <div className="flex justify-center pt-20">
        <div className="w-1/2 flex flex-col pb-12">
          <input
            placeholder="Asset Name"
            className="mt-8 border rounded p-4"
            value={formInput.name}
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <textarea
            placeholder="Asset description"
            className="mt-2 border rounded p-4"
            value={formInput.description}
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <input
            placeholder="Min 0.001 ETH"
            className="mt-8 border rounded p-4"
            step="0.001"
            type="number"
            value={formInput.price}
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />
          {/* <input
            type="file"
            name="Asset"
            className="my-4"
            //onChange={OnChangeFile}
          /> */}

          <label className="block pt-5 pb-5">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              onChange={OnChangeFile}
              className="block w-full text-sm text-gray-500 file:py-2 file:px-6 file:rounded file:border-1 file:border-gray-400"
            />
          </label>

          <div className="text-green text-center">{message}</div>
          <button
            onClick={createSale}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Create NFT
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Create;


