import orientCRUDService from '../../../database/crud.service';

const service1 = async () => {
    // get Income

    const income = await orientCRUDService.executeSelect(`select sum(income) as income from income`)

    const envelopes = await orientCRUDService.executeSelect(`select from challenge`);

    return {
        income: income[0].income,
        envelopes
    }

};

const service2 = async (uuid, type, amount) => {
    // get Income

    const getEnvelope = await orientCRUDService.executeSelect(`select from challenge where uuid=:uuid`, { uuid });

    if (getEnvelope.length > 0) {
        if (type === 'ADD') {
            await orientCRUDService.executeCUD(`update challenge set balance = balance + :amount where uuid = :uuid`, { amount, uuid });
        } else {
            await orientCRUDService.executeCUD(`update challenge set balance = balance - :amount where uuid = :uuid`, { amount, uuid });
        }

        await orientCRUDService.executeCUD(`update income set income = income - :amount`, { amount });
    }

    return {}

};

const service3 = async (amount) => {
    await orientCRUDService.executeCUD(`update income set income = income + :amount`, { amount });
    return {}

};

export default {
    service1,
    service2,
    service3
};