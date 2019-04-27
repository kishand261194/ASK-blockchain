App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:7545',
    init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    App.populateAddress();
    return App.initContract();

  },

  initContract: function() {
      $.getJSON('Counter.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var voteArtifact = data;
    App.contracts.vote = TruffleContract(voteArtifact);

    // Set the provider for our contract
    App.contracts.vote.setProvider(App.web3Provider);
    return App.bindEvents();
  });
  },

  bindEvents: function() {
    $(document).on('click', '#increment', App.increment);
    $(document).on('click', '#decrement', App.decrement);
    $(document).on('click', '#init',App.initialize);
    $(".value").text(App.getValue());
  },

  populateAddress : function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        if(web3.eth.coinbase != accounts[i]){
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_address').append(optionElement);
        }
      });
    });
  },

  increment: function(){

    var voteInstance;

    App.contracts.vote.deployed().then(function(instance) {
      var increment = $('#numberInput').val();
      voteInstance = instance;
      return voteInstance.increment(increment);
    }).then(function(result, err){
        if(result){
            console.log(result.receipt.status);
            if(parseInt(result.receipt.status) == 1)
            {
            alert("Value Incremented successfully")
            location.reload();
            }
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }
    });
},

  getValue: function(){

    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.get();
    }).then(function(result, err){
        if(result){
            $(".value").text(result.c[0]);

        }
        else
        {
          console.log(err);
        }
    });
},


  decrement: function(){

    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      var decrement = $('#numberInput').val();
      voteInstance = instance;
      return voteInstance.decrement(decrement);
    }).then(function(result, err){
        if(result){
            console.log(result.receipt.status);
            console.log(result);
            if(parseInt(result.receipt.status) == 1)
            {
            alert("Decrement Done successfully")
            location.reload();
          }
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }
    });
},


 initialize: function(){
    console.log("hereree");
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      var initialize = $('#numberInput').val();
      console.log(initialize);
      voteInstance = instance;
      return voteInstance.initialize(initialize);
    }).then(function(result, err){
        if(result){
            console.log(result.receipt.status);
            console.log(result);
            if(parseInt(result.receipt.status) == 1)
            {
            alert("Counter has been initialized")
            location.reload();
          }
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }
    });
}
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
