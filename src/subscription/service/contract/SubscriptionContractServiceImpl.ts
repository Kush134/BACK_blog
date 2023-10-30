import {NewSubscriptionEvent} from "./NewSubscriptionEvent";
import {SubscriptionContractService} from "./SubscriptionContractService";
import {SubscriptionCreationEvent} from "@/subscription/service/contract/SubscriptionCreationEvent";
import {ethers, EventFilter, providers} from "ethers";
import {Result} from "@ethersproject/abi";

const initialContractBlock = 29651840;
const networkRpc = "https://data-seed-prebsc-2-s3.binance.org:8545";
const subscriptionContractAddress = "0xc65136CA205FbefBcB30466dD62A742a1B372327";

const signatureNewSubscription = 'NewSubscription(bytes32,address,uint256,uint256,uint256,address,uint256)';
const abiNewSubscription = ['event NewSubscription(bytes32 indexed hexId, address indexed participant, uint256 indexed author, uint256 subscriptionIndex, uint256 subscriptionEndTime, address tokenAddress, uint256 amount)'];

// TODO add this fields
const signatureSubcriptionCreation = 'NewOneTimeSubscriptionCreated(uint256,bytes32,address,uint256,(uint256,uint16)[])';
const abiSubcriptionCreation = ['event NewOneTimeSubscriptionCreated(uint256 indexed author, bytes32 indexed hexId, address tokenAddress, uint256 price, (uint256,uint16)[] discounts)'];

const provider = new providers.JsonRpcProvider({url: networkRpc});

// TODO add indexer instead full log scan
export class SubscriptionContractServiceImpl implements SubscriptionContractService {

    async findPaidSubscriptions(subscriptionHexId: string, address: string): Promise<Array<NewSubscriptionEvent>> {

        console.log('Query for logs ' + subscriptionHexId);

        const filter = {
            address: subscriptionContractAddress,
            fromBlock: initialContractBlock,
            toBlock: 'latest',
            topics: [ethers.utils.id(signatureNewSubscription)]
        }

        const logs = await this.getLogs(abiNewSubscription, filter);

        return logs.map((log) => {

            const {hexId, participant, author, subscriptionIndex, subscriptionEndTime, tokenAddress, amount} = log;

            return {
                hexId: hexId,
                participant: participant,
                author: author.toString(),
                subscriptionId: subscriptionIndex.toNumber(),
                subscriptionEndTime: subscriptionEndTime.toString(),
                tokenAddress: tokenAddress,
                amount: amount.toString(),
            }
        })
            .filter(log => log.hexId === subscriptionHexId)
            .filter(log => log.participant === address);
    }

    async findSubscriptionCreations(subscriptionHexId: string): Promise<Array<SubscriptionCreationEvent>> {
        console.log('Query for logs ' + subscriptionHexId);

        const filter = {
            address: subscriptionContractAddress,
            fromBlock: initialContractBlock,
            toBlock: 'latest',
            topics: [ethers.utils.id(signatureSubcriptionCreation)]
        }

        const logs = await this.getLogs(abiSubcriptionCreation, filter);

        return logs.map((log) => {

            const {author, hexId, tokenAddress, price, discounts} = log;

            return {
                author: author.toString(),
                hexId: hexId.toString(),
                tokenAddress: tokenAddress.toString(),
                price: price.toString(),
                discounts: discounts
            }
        })
            .filter(log => log.hexId === subscriptionHexId);
    }

    private async getLogs(abi: string[], filter: EventFilter): Promise<Array<Result>> {
        const iface = new ethers.utils.Interface(abi);
        return await provider
            .getLogs(filter)
            .then(logs => logs.map(log => iface.parseLog(log).args));
    }
}

const subscriptionContractService: SubscriptionContractService = new SubscriptionContractServiceImpl();
export {subscriptionContractService}