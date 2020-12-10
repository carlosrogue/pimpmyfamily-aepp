const contractSource = `payable contract FundRaiser =
  record fund_request = { requester : address, reason: string, currency: string, amount: int, due_date: int, raised: int }

  record state = { requests : map(address, map(address, fund_request)) }

  entrypoint init() = { requests = {}}

  entrypoint getRequests(): list(address * fund_request) =
    Map.to_list(state.requests[Call.caller])

  entrypoint getRequest(giver: address, addr: address) : fund_request =
    switch(Map.lookup(giver, state.requests))
      None => abort("No fund requests were found.")
      Some(reqs) => switch(Map.lookup(addr, reqs))
                      None => abort("There was no fund request for given address")
                      Some(req) => req

  entrypoint requestExists(addr: address): bool =
    Map.member(Call.caller, state.requests) && Map.member(addr, state.requests[Call.caller])

  stateful entrypoint registerFundRequest(giver: address, reason': string, currency': string, amount': int, best_before: int) =
    let beneficiary = Call.caller
    let request = { requester = beneficiary, reason = reason', currency = currency', amount = amount', due_date = best_before, raised = 0 }
    switch(Map.lookup(giver, state.requests))
      None => put(state { requests[giver] = { [beneficiary] = request } })
      Some(currentRequests) => put(state { requests[giver][beneficiary] = request })

  payable stateful entrypoint fund(address: address) =
    require(requestExists(address), "There are no requests for given address")
    let request = getRequest(Call.caller, address)
    let oracleExchangeRateInAetos = "0.00000770"
    let aeBtcExchangeRate = 2

    let requested = request.amount * aeBtcExchangeRate
    let remainder = requested - request.raised
    if (remainder > 0 && Call.value > 0)
      let transferValue = if (Call.value > remainder) remainder else Call.value
      Chain.spend(address, transferValue)
      let updatedRequests = state.requests{ [Call.caller][address].raised = request.raised + transferValue }
      put(state{ requests = updatedRequests })
`;
let contractAddress = "ct_5Xo4DzsBnuLgkhCP5D8w4A3qxV9zY2oK4LK61hziTtrM36wFa";

// { "requester": "ak_2AFioRXb7ZgsShpt1sfm9mPap4C5eFXgZ5D7FMMCFFMpNijCsz", "reason": "test", "currency": "BTC", "amount": 5, "due_date": 0, "raised": 0 }
var requestsArray = [
];
var client = null;

function renderRequests() {
    var template = $("#template").html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, { requestsArray });
    $("#requestsBody").html(rendered);
}

async function callStatic(func, args) {
    const contract = await client.getContractInstance(contractSource, { contractAddress });
    const calledGet = await contract.call(func, args, { callStatic: true }).catch(e => console.error(e));
    console.log('calledGet', calledGet);

    const decodedGet = await calledGet.decode().catch(e => console.error(e));
    console.log('decodedGet', decodedGet);

    return decodedGet;
}

async function contractCall(func, args, value) {
    const contract = await client.getContractInstance(contractSource, { contractAddress });
    const calledSet = await contract.call(func, args, { amount: value }).catch(e => console.error(e));

    return calledSet;
}

window.addEventListener("load", async () => {

    client = await Ae.Aepp();

    const requests = await callStatic('getRequests', []);

    if (requests) {
        requestsArray = requests.map(x => x[1]);
        console.log(requests);
    }

    renderRequests();
});

jQuery("#requestsBody").on("click", ".fund-btn", async function (event) {
    let value = $(this).siblings("input").val();
    let dataIdx = event.target.id;
    let foundIdx = requestsArray.findIndex(req => req.requester == dataIdx);

    await contractCall('fund', [dataIdx], value);
    requestsArray[foundIdx].raised += parseInt(value);

    renderRequests();
});

$("#askBtn").click(async function () {
    let giver = $("#giver").val();
    let reason = $("#reason").val();
    let currency = $("#currency").val();
    let amount = parseInt($("#amount").val());

    // ak_2bKhoFWgQ9os4x8CaeDTHZRGzUcSwcXYUrM12gZHKTdyreGRgG, test, BTC, 5, 0
    await contractCall('registerFundRequest', [giver, reason, currency, amount, 0], 0);

    renderRequests();
});
