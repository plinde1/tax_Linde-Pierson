require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/layers/support/Field",
  "esri/Graphic"
], (Map, MapView, FeatureLayer, Legend, Field, Graphic) => {


  const statesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized_Boundaries/FeatureServer/0",
    title: "US States",
    popupTemplate: {
      // autocast as esri/PopupTemplate
      title: "{STATE_NAME }",
      content:
        "Population: {POPULATION }  " 
    },
    opacity: 0.9
  });

  const map = new Map({
    basemap: "gray-vector",
    layers: []
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-100.3487846, 39.58907],
    zoom: 3
  });

  const legend = new Legend({
    view: view
  });

  view.ui.add(legend, "bottom-left");
  var $table = $('#table')


///initial query that loads state geometry into existing stateObj

var loadStates = function(){
      var table = document.getElementById("myTable");

// Create an empty <tr> element and add it to the 1st position of the table:
Object.entries(stateObj).sort().forEach(([key, value], index) => {
  // console.log(`${index}: ${key} = ${value}`);

  $table.bootstrapTable('insertRow', {
      index: index,
      row: {
        state: key.replace("_", " "),
      
      }
      
  })

});
let query = statesLayer.createQuery();
//   query.where = "1==1"
query.returnGeometry = true;
query.outFields = [ "STATE_ABBR", "STATE_NAME" ];

statesLayer.queryFeatures(query)
  .then(function(response){
   console.log(response)
   response.features.forEach(function(feature, ind){
      if(feature.attributes.STATE_ABBR != "DC"){
          stateName = feature.attributes.STATE_NAME
          //console.log(stateObj[stateName])
          stateObj[stateName]['geometry'] = feature.geometry
      }

   })
   console.log(stateObj)
  }); 
      
      
 
}
  loadStates()
///this is where you'll query an additional service to add more data to you mapping dashboard
///here are some examples
//this example is from the URL below
//https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Median_Income_by_Race_and_Age_Selp_Emp_Boundaries/FeatureServer
//however, there are a whole bunch of state level datasets you can use here:
// repository for american community survey services: https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services 

//Create a feature layer from your URL
  var medianIncomeUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Median_Income_by_Race_and_Age_Selp_Emp_Boundaries/FeatureServer/0"
  const medianIncomeLayer = new FeatureLayer({
    url: medianIncomeUrl,
    title: "Median Income",
  });

//Make function to execture query
var loadAdditionalData1 =function(){
  ////Create a new query object and give it the correct properties for what you want
  let additionalQuery = medianIncomeLayer.createQuery();
  additionalQuery.returnGeometry = false;
  additionalQuery.outFields = "*"
  ////execute query on your new layer
 medianIncomeLayer.queryFeatures(additionalQuery).then(function(r){
console.log(r)
r.features.forEach(function(feature){
   ///loop through the results to add new features to your stateObj
  if(feature.attributes['STUSPS'] != "DC"){
      stateName = feature.attributes['NAME']
      var income = feature.attributes['B19049_001E']
    
      stateObj[stateName]['medianIncome'] = income
  }
  })
  });


  //Create a feature layer from your URL
  var unemploymentUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Employment_Status_Boundaries/FeatureServer/0"
  const unemploymentLayer = new FeatureLayer({
    url: unemploymentUrl,
    title: "unemployed",
  });

var loadAdditionalData =function(){
  ////Create a new query object and give it the correct properties for what you want
  let additionalQuery = unemploymentLayer.createQuery();
  additionalQuery.returnGeometry = false;
  additionalQuery.outFields = "*"
  ////execute query on your new layer
  unemploymentLayer.queryFeatures(additionalQuery).then(function(r){
console.log(r)
r.features.forEach(function(feature){
   ///loop through the results to add new features to your stateObj
  if(feature.attributes['STUSPS'] != "DC"){
      stateName = feature.attributes['NAME']
      var unemployment = feature.attributes['B23025_calc_pctUnempE']
      
      stateObj [stateName] ['unemployment'] = unemployment
    
  }
  })
  });

  }
loadAdditionalData()
  const between = (x, min, max) => {
      return x >= min && x <= max;
    }
    const getRate = function(arr, inc){
      taxRate = 0
      for(var i =0; i<arr.range.length; i++){
          if(between(inc, arr.range[i][0], arr.range[i][1])){
              taxRate = arr.rate[i]
              return [taxRate, arr.range[i][0]]
          }
          if(i == arr.range.length -1){
              return [taxRate]
          }
      }
    }
    
    }
  loadAdditionalData1()
    const between = (x, min, max) => {
        return x >= min && x <= max;
      }
      const getRate = function(arr, inc){
        taxRate = 0
        for(var i =0; i<arr.range.length; i++){
            if(between(inc, arr.range[i][0], arr.range[i][1])){
                taxRate = arr.rate[i]
                return [taxRate, arr.range[i][0]]
            }
            if(i == arr.range.length -1){
                return [taxRate]
            }
        }
      };
  
  const formElement = document.querySelector('form')
  formElement.addEventListener("submit", (e) => {
          // on form submission, prevent default
          e.preventDefault();
          $table.bootstrapTable('removeAll')
          var income = form.querySelector('input[name="income"]').value.replaceAll(",", "")
          var married = form.querySelector('input[name="marriedRadios"]').checked
          var dependents = $('#dependents').val()
          console.log(dependents)
          var graphics = []
          if(income > 100000000){
              alert("Sorry, you make too much money for this tool to be useful")
          }
          else{
              Object.entries(stateObj).forEach(([key, value], index) => {
       
                  if(value.notax == true){
                      $table.bootstrapTable('insertRow', {
                          index: index,
                          row: {
                            state: key.replace("_", " "),
                             incomeAfterTaxes: income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                             grossDifference: 0,
                             percentDifference:0,
                             ////Add new row to states with no tax///
                             medianIncome: value.medianIncome,
                             unemployment: value.unemployment
                          }
                      })
                      let gfx = new Graphic({
                          geometry: value.geometry,
                          attributes: {"Income_Before_Taxes" : income.toString(),
                          "Income_After_Taxes" :  income.toString(),
                          "Total_State_Tax_Owed" : 0,
                          "State_Abbr" : value.abb,
                          "PercentOwed": 0,
                          "ObjectId": index
                      }
                        });
                        graphics.push(gfx)
                  }
                  else  {
                      if(married == true){
                          rateArr = getRate(value.married_brackets, income)
                          rate = rateArr[0]
                          bracket = rateArr[1]
                          incomeWithExemptions = income - value.SD_married - value.married_exemption - (value.dependent_exemption * dependents)
                          taxBeforeCredits = incomeWithExemptions * rate
                          taxAfterCreditsRaw = (taxBeforeCredits - value.married_credit - (value.dependent_credit * dependents)) 
                          totalTax = taxAfterCreditsRaw > 0 ? Math.trunc(taxAfterCreditsRaw) : 0 
                          totalExemptions = value.SD_married + (value.dependent_exemption * dependents) + value.married_exemption
                          totalCredits = (value.dependent_credit * dependents) + value.married_credit
                          // console.log("total tax owed in " + value.abb + " " + totalTax.toString())
                      }
                      else{
                          rateArr = getRate(value.married_brackets, income)
                          rate = rateArr[0]
                          bracket = rateArr[1]
                          incomeWithExemptions = income - value.SD_single - value.personal_exemption - (value.dependent_exemption * dependents)
                          taxBeforeCredits = incomeWithExemptions * rate
                          taxAfterCreditsRaw = taxBeforeCredits - value.personal_credit - (value.dependent_credit * dependents)
                          totalTax = taxAfterCreditsRaw > 0 ? Math.trunc(taxAfterCreditsRaw) : 0 
                          totalExemptions = value.SD_single + (value.dependent_exemption * dependents) + value.personal_exemption
                          totalCredits = (value.dependent_credit * dependents) + value.personal_credit
                          // console.log("total tax owed in " + value.abb + " " + totalTax.toString())
                          
                      }
                      $table.bootstrapTable('insertRow', {
                          index: index,
                          row: {
                            state: key.replace("_", " "),
                            bracket: (rate * 100).toFixed(2),
                            incomeAfterTaxes: Math.trunc((income - totalTax)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            grossDifference: Math.trunc(totalTax).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            percentDifference: ((totalTax/ income) * 100).toFixed(2), 
                            totalExemptions: Math.trunc(totalExemptions).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            totalCredits: Math.trunc(totalCredits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
///////////Add new row here too //////////                            
                            medianIncome: value.medianIncome,
                            unemployment: value.unemployment

                          }
                      })
                      value['incomeBeforeTaxes'] =  Math.trunc(income)
                      value['incomeAfterTaxes'] = Math.trunc((income - totalTax))
                      value['grossDifference'] =  Math.trunc(totalTax)
                      value['percentDifference'] =  ((totalTax/ income) * 100)
                      value['bracket'] = bracket.toString().replace("[", "").replace("]", "")
                      let gfx = new Graphic({
                          geometry: value.geometry,
                          attributes: {"Income_Before_Taxes" :value['incomeBeforeTaxes'], 
                          "Income_After_Taxes" :  value['incomeAfterTaxes'],
                          "Total_State_Tax_Owed" : value['grossDifference'],
                          "State_Abbr" : value.abb,
                          "PercentOwed": value['percentDifference'].toFixed(2),
                          "ObjectId": index
                      }
                        });
                        graphics.push(gfx)

                      $("th[data-field='percentDifference'] .sortable").click();
                  }
              })
              console.log(stateObj)
          }
              map.layers.remove(statesLayer)
              map.layers.removeAll()
              const noTax = {
                  type: "simple-fill", // autocasts as new SimpleFillSymbol()
                  color: "#0c7d3f",
                  style: "solid",
                  outline: {
                    width: 0.2,
                    color: [255, 255, 255, 0.5]
                  }
                };
            
                const under3 = {
                  type: "simple-fill", // autocasts as new SimpleFillSymbol()
                  color: "#99bf47",
                  style: "solid",
                  outline: {
                    width: 0.2,
                    color: [255, 255, 255, 0.5]
                  }
                };
            
                const threeToFive = {
                  type: "simple-fill", // autocasts as new SimpleFillSymbol()
                  color: "#d6a206",
                  style: "solid",
                  outline: {
                    width: 0.2,
                    color: [255, 255, 255, 0.5]
                  }
                };
            
                const over5 = {
                  type: "simple-fill", // autocasts as new SimpleFillSymbol()
                  color: "#c42f02",
                  style: "solid",
                  outline: {
                    width: 0.2,
                    color: [255, 255, 255, 0.5]
                  }
                };
              const renderer = {
                  type: "class-breaks", // autocasts as new ClassBreaksRenderer()
                  field: "PercentOwed",
                  legendOptions: {
                    title: "Total Actual State Tax Owed"
                  },
                  defaultSymbol: {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: "black",
                    style: "backward-diagonal",
                    outline: {
                      width: 0.5,
                      color: [50, 50, 50, 0.6]
                    }
                  },
                  defaultLabel: "no data",
                  classBreakInfos: [
                    {
                      minValue: 0,
                      maxValue: 0,
                      symbol: noTax,
                      label: "No tax"
                    },
                    {
                      minValue: 0.01,
                      maxValue: 3,
                      symbol: under3,
                      label: "0 - 3%"
                    },
                    {
                      minValue: 3,
                      maxValue: 5,
                      symbol: threeToFive,
                      label: "3 - 5%"
                    },
                    {
                      minValue: 5.01,
                      maxValue: 100,
                      symbol: over5,
                      label: "more than 5%"
                    }
                  ]
                };
              const layer = new FeatureLayer({
                  source: graphics,  // array of graphics objects
                  objectIdField: "ObjectId",
                  fields: [{
                    name: "ObjectId",
                    type: "oid"
                  }, {
                    name: "Income_Before_Taxes",
                    type: "double"
                  }, 
                  {
                      name: "Income_After_Taxes",
                      type: "double"
                    }, {
                      name: "Total_State_Tax_Owed",
                      type: "double"
                    }, 
                    {name: "PercentOwed", 
                  type: "double"
                  },
                    {
                      name: "State_Abbr",
                      type: "string"
                    }, 
              ],
                  popupTemplate: {
                    content: "State: {State_Abbr} <br>" +
                     "State tax as percent of income: %{PercentOwed} <br>"+ 
                     "Total State Tax Owed: {Total_State_Tax_Owed} <br>" +
                    "Income after states taxes: {Income_After_Taxes}"
                  },
                  renderer: renderer
                  
                });
                
                map.add(layer);
        });
  });