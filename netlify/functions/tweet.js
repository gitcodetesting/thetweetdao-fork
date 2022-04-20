const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
const { TwitterApi } = require('twitter-api-v2');

const contract = '0x1c8254842BFdefD96Ec311e2b38440b75c9A9dF3';

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);

  const timestamp = body.timestamp;
  const signature = body.signature;
  const text = body.text;

  const message = 'RooftopDAO: ' + timestamp + ' ' + text;

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

    await client.v2.tweet(text);

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: 'Success' }),
    };
  } else {
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: 'Wallet doesn\'t contain any RooftopDAO NFTs' }),
    };
  }
}
