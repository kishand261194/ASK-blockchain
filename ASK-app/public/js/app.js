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

    return App.initContract();

  },

  initContract: function() {
    $.getJSON('Askconsortium.json', function(data) {
    console.log(data)
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var askArtifact = data;
    App.contracts.ask = TruffleContract(askArtifact);
    console.log('heree')
    // Set the provider for our contract
    App.populateAddress();
    App.contracts.ask.setProvider(App.web3Provider);
    return App.bindEvents();
  });
  console.log('here3');
  },

  bindEvents: function() {
    $(document).on('click', '#register', App.handleRegister);
    $(document).on('click', '#unregister', function(){ var ad = $('#enter_address').val(); App.handleUnregister(ad); });
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
  handleUnregister: function(addr){
    var askArtifact;
    App.contracts.ask.deployed().then(function(instance) {
      askArtifact = instance;
      return askArtifact.unregister(addr);
    }).then(function(result, err){
        if(result){
            console.log(result.receipt.status);
console.log(result);
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " unregistration done successfully")
            else
            alert(addr + " unregistration not done successfully due to revert")
        } else {
            alert(addr + " unregistration failed")
        }
    });
},

  handleRegister: function(addr){
    var userInstance;
    App.contracts.ask.deployed().then(function(instance) {
      userInstance = instance;
      return userInstance.register({from: web3.eth.defaultAccount , value: web3.toWei(5)});
    }).then(function(result, err){
        if(result){
            console.log(result.receipt.status);
            console.log(result);
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " registration done successfully")
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
