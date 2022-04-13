const Web3 = require('web3');
const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + process.env.INFURA_ID);
const { TwitterApi } = require('twitter-api-v2');

const contract = '0x0Db9e2f4395a179e4ADd26B43cFe8E4Ea1830B46';

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);

  const timestamp = body.timestamp;
  const signature = body.signature;
  const text = body.text;

  const message = 'TweetDao: ' + timestamp + ' ' + text;

  const addressSource = web3.eth.accounts.recover(message, signature);

  const newContract = new web3.eth.Contract(require('../../contract-abi.json'), contract);

  const result = await newContract.methods.balanceOf(addressSource).call();

  const balance = web3.utils.fromWei(result);

  if (balance > 0) {
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const tokenKey = process.env.TOKEN_KEY;
    const tokenSecret = process.env.TOKEN_SECRET;

    const client = new TwitterApi({
      appKey: consumerKey,
      appSecret: consumerSecret,
      accessToken: tokenKey,
      accessSecret: tokenSecret,
    });

    await client.v1.tweet(text);

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: 'Success' }),
    };
  } else {
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: 'Wallet doesn\'t contain any TweetDao NFTs' }),
    };
  }
}
