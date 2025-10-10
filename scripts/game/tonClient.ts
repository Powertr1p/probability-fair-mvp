import { TonClient } from "@ton/ton";

// Создаем единый, общий экземпляр TonClient с вашим API ключом
export const sharedClient = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: "3853a7a7778eaefeb92a67e7851ca46e6a20b67e25b52b5bab33b4b9e2563acb"
});
