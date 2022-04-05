// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


// we need to know first which token ids we askin first
//our contract takes a base URI + tokenId 
// we need to create a generic api endpoint for all the nfts
// we need to make a generic endpoint using nextJS that have a dynamic api
// dynamic routing works by renaming your api file and type name in squared brackets
// this tells nextJS that there is a dynamic variable here
// the name you give to your file doesnt matter just know that the name  effect how you read that value

export default function handler(req, res) {
    //the property is tokenId since the file name is token Id
    //we get the tokenId from query parameters
    const tokenId = req.query.tokenId;

    // we first need to know which token id we ask for
    // our contract take a base URI + tokenId
    // if for exapmple we have an uri of https://crypto.com/
    //and a token Id of 1
    // calling the token URI for token Id of 1 will give us https://crypto.com/1
    // we first need to create an generic api endpoint to serve multiple nfts
    // next.js make use of an dynamic api by
    // typing the file name in []


    // we want a name, a description and an image for our nft metadata
    // the url for the image must be public
    const image_url = 'https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/';
    //url need to be public accesible, we replace the number svg with token id

    // we return an object
     res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers in crypto",
    image: image_url + tokenId + ".svg",
    });
}
