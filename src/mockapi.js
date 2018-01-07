import Vue from 'vue'
import axios from 'axios'

var MockAdapter = require('axios-mock-adapter')

var elementTypes = [
  {'id': 1, 'name': 'Arbrat'},
  {'id': 2, 'name': 'Arbustiva'},
  {'id': 4, 'name': 'Gespa amb reg'},
  {'id': 8, 'name': 'Gespa sense reg'},
  {'id': 7, 'name': 'Marges Carrers'},
  {'id': 3, 'name': 'Parterre flor'},
  {'id': 5, 'name': 'Prat'},
  {'id': 6, 'name': 'Saul\u00f3'},
  {'id': 9, 'name': 'Sector'}
]
var contracts = [
  {'id': 11,
    'name': 'Proves Microdisseny Lot 8',
    'groups': [
      {'id': 939, 'name': 'Av. de Ramon Folch', 'code': '0511', 'details': [], 'types': [1]},
      {'id': 942, 'name': 'Av. de Sant Francesc', 'code': '0569', 'details': [], 'types': [1]},
      {'id': 966, 'name': 'Bernat Boades', 'code': 's267', 'details': [{'quantity': 3.33, 'element_type': 9}, {'quantity': 388.0, 'element_type': 3}, {'quantity': 28.87, 'element_type': 2}], 'types': [2, 3, 1, 9]},
      {'id': 972, 'name': 'Bonastruc de Porta - Figuerola', 'code': 's284', 'details': [{'quantity': 8.63, 'element_type': 9}, {'quantity': 20.36, 'element_type': 6}, {'quantity': 57.68, 'element_type': 4}, {'quantity': 23.34, 'element_type': 3}, {'quantity': 1004.18, 'element_type': 2}], 'types': [2, 3, 6, 4, 1, 9]},
      {'id': 960, 'name': 'Cadesbank', 'code': 's260', 'details': [{'quantity': 1.99, 'element_type': 9}, {'quantity': 249.3, 'element_type': 2}], 'types': [1, 2, 9]},
      {'id': 897, 'name': 'C. d\'Anselm Clav\u00e9 i Camps', 'code': '0029', 'details': [], 'types': [1]},
      {'id': 899, 'name': 'C. de Bernat Baci\u00e0', 'code': '0046', 'details': [], 'types': [1]},
      {'id': 900, 'name': 'C. de Bernat Boades', 'code': '0071', 'details': [], 'types': [1]},
      {'id': 902, 'name': 'C. de Bonastruc de Porta', 'code': '0078', 'details': [], 'types': [1]},
      {'id': 905, 'name': 'C. de Canonge Dorca', 'code': '0114', 'details': [], 'types': [1]},
      {'id': 908, 'name': 'C. de Caterina Albert', 'code': '0144', 'details': [], 'types': [1]},
      {'id': 909, 'name': 'C. de Crist\u00f2fol Grober', 'code': '0172', 'details': [], 'types': [1]},
      {'id': 916, 'name': 'C. de Doctor Francesc Coll i Turbau', 'code': '0230', 'details': [], 'types': [1]},
      {'id': 913, 'name': 'C. de Ferran Agull\u00f3 i Vidal', 'code': '0206', 'details': [], 'types': [1]},
      {'id': 949, 'name': 'C. de Ferran Soldevila', 'code': '0758', 'details': [], 'types': [1]},
      {'id': 915, 'name': 'C. de Figuerola', 'code': '0212', 'details': [], 'types': [1]},
      {'id': 911, 'name': 'C. de Francesc Eiximenis', 'code': '0184', 'details': [], 'types': [1]},
      {'id': 917, 'name': 'C. de Francesc Rog\u00e9s', 'code': '0234', 'details': [], 'types': [1]},
      {'id': 928, 'name': 'C. de Josep Maluquer i Salvador', 'code': '0350', 'details': [], 'types': [1]},
      {'id': 926, 'name': 'C. de Josep Viader i Moliner', 'code': '0316', 'details': [], 'types': [1]},
      {'id': 927, 'name': 'C. de Juli Garreta', 'code': '0317', 'details': [], 'types': [1]},
      {'id': 896, 'name': 'C. del 20 de juny', 'code': '0002', 'details': [], 'types': [1]},
      {'id': 906, 'name': 'C. del Carme', 'code': '0125', 'details': [], 'types': [1]},
      {'id': 920, 'name': 'C. de les Hortes', 'code': '0272', 'details': [], 'types': [1]},
      {'id': 922, 'name': 'C. de l\'Illa', 'code': '0278', 'details': [], 'types': [1]},
      {'id': 934, 'name': 'C. de l\'Obra', 'code': '0429', 'details': [], 'types': [1]},
      {'id': 898, 'name': 'C. dels Artillers', 'code': '0036', 'details': [], 'types': [1]},
      {'id': 923, 'name': 'C. dels Impressors Oliva', 'code': '0288', 'details': [], 'types': [1]},
      {'id': 946, 'name': 'C. del Tor\u00edn', 'code': '0639', 'details': [], 'types': [1]},
      {'id': 931, 'name': 'C. de Mestre Francesc Civil', 'code': '0383', 'details': [], 'types': [1]},
      {'id': 932, 'name': 'C. de Miquel Blay', 'code': '0391', 'details': [], 'types': [1]},
      {'id': 948, 'name': 'C. de Moss\u00e8n Joan Pons', 'code': '0701', 'details': [], 'types': [1]},
      {'id': 935, 'name': 'C. de Pau Casals', 'code': '0449', 'details': [], 'types': [1]},
      {'id': 936, 'name': 'C. de Pere de Palol', 'code': '0460', 'details': [], 'types': [1]},
      {'id': 940, 'name': 'C. de Ramon Turr\u00f3', 'code': '0513', 'details': [], 'types': [1]},
      {'id': 944, 'name': 'C. de Santa Clara', 'code': '0593', 'details': [], 'types': [1]},
      {'id': 945, 'name': 'C. de Santa Eug\u00e8nia', 'code': '0596', 'details': [], 'types': [1]},
      {'id': 943, 'name': 'C. de Sant Joan Baptista de La Salle', 'code': '0576', 'details': [], 'types': [1]},
      {'id': 901, 'name': 'C. de Tom\u00e1s de Lorenzana', 'code': '0074', 'details': [], 'types': [1]},
      {'id': 947, 'name': 'C. d\'Ult\u00f2nia', 'code': '0671', 'details': [], 'types': [1]},
      {'id': 962, 'name': 'Dr. Francesc Coll i Turbau', 'code': 's262', 'details': [{'quantity': 0.62, 'element_type': 9}, {'quantity': 76.99, 'element_type': 2}], 'types': [1, 2, 9]},
      {'id': 919, 'name': 'Gran Via de Jaume I', 'code': '0260', 'details': [], 'types': [1]},
      {'id': 955, 'name': 'G\u00fcell 93', 'code': 's005', 'details': [{'quantity': 5.96, 'element_type': 9}, {'quantity': 963.52, 'element_type': 8}, {'quantity': 21.83, 'element_type': 2}], 'types': [2, 8, 1, 9]},
      {'id': 969, 'name': 'Joan Pons', 'code': 's270', 'details': [{'quantity': 5.77, 'element_type': 9}, {'quantity': 1906.74, 'element_type': 6}, {'quantity': 5.96, 'element_type': 2}], 'types': [2, 6, 1, 9]},
      {'id': 956, 'name': 'Jocs infantils C.Josep Vilader i Moliner', 'code': 's169', 'details': [{'quantity': 1.24, 'element_type': 9}, {'quantity': 414.29, 'element_type': 6}], 'types': [1, 6, 9]},
      {'id': 957, 'name': 'Jocs infantils Pau Casals', 'code': 's215', 'details': [{'quantity': 1.51, 'element_type': 9}, {'quantity': 503.67, 'element_type': 6}], 'types': [1, 6, 9]},
      {'id': 918, 'name': 'Pg. del General Mendoza', 'code': '0248', 'details': [], 'types': [1]},
      {'id': 964, 'name': 'Pl. Catalunya', 'code': 's264', 'details': [{'quantity': 5.49, 'element_type': 9}, {'quantity': 454.6, 'element_type': 4}, {'quantity': 345.91, 'element_type': 2}], 'types': [2, 4, 1, 9]},
      {'id': 973, 'name': 'Pl. Constituci\u00f3', 'code': 's286', 'details': [{'quantity': 10.03, 'element_type': 9}, {'quantity': 3342.97, 'element_type': 6}], 'types': [1, 6, 9]},
      {'id': 903, 'name': 'Pl. de Francesc Calvet i Rubalcaba', 'code': '0089', 'details': [], 'types': [1]},
      {'id': 951, 'name': 'Pl. de Joan Brossa', 'code': '0830', 'details': [], 'types': [1]},
      {'id': 952, 'name': 'Pl. de Joaquim Pla i Dalmau', 'code': '0898', 'details': [], 'types': [1]},
      {'id': 953, 'name': 'Pl. de Josep Maria Lid\u00f3n Corb\u00ed', 'code': '0926', 'details': [], 'types': [1]},
      {'id': 924, 'name': 'Pl. de Josep Pallach i Carol\u00e0', 'code': '0312', 'details': [], 'types': [1]},
      {'id': 925, 'name': 'Pl. de Josep Pla', 'code': '0313', 'details': [], 'types': [1]},
      {'id': 910, 'name': 'Pl. de la Diputaci\u00f3', 'code': '0180', 'details': [], 'types': [1]},
      {'id': 921, 'name': 'Pl. de l\'Hospital', 'code': '0274', 'details': [], 'types': [1]},
      {'id': 929, 'name': 'Pl. del Marqu\u00e8s de Camps', 'code': '0359', 'details': [], 'types': [1]},
      {'id': 933, 'name': 'Pl. de Miquel de Palol', 'code': '0392', 'details': [], 'types': [1]},
      {'id': 937, 'name': 'Pl. de Pompeu Fabra', 'code': '0474', 'details': [], 'types': [1]},
      {'id': 938, 'name': 'Pl. de Prudenci Bertrana', 'code': '0495', 'details': [], 'types': [1]},
      {'id': 912, 'name': 'Pl. d\'Espanya', 'code': '0193', 'details': [], 'types': [1]},
      {'id': 958, 'name': 'Pl. Espanya (Sector)', 'code': 's258', 'details': [{'quantity': 5.97, 'element_type': 9}, {'quantity': 776.71, 'element_type': 4}, {'quantity': 163.76, 'element_type': 2}], 'types': [2, 4, 1, 9]},
      {'id': 971, 'name': 'Pl. Independ\u00e8ncia', 'code': 's283', 'details': [{'quantity': 3.11, 'element_type': 9}, {'quantity': 959.54, 'element_type': 6}], 'types': [1, 6, 9]},
      {'id': 976, 'name': 'Pl. Josep Pla', 'code': 's301', 'details': [{'quantity': 0.14, 'element_type': 9}, {'quantity': 17.93, 'element_type': 3}], 'types': [1, 3, 9]},
      {'id': 968, 'name': 'Pl. Mela Mutermilch', 'code': 's269', 'details': [{'quantity': 6.7, 'element_type': 9}, {'quantity': 2034.71, 'element_type': 6}, {'quantity': 74.08, 'element_type': 2}], 'types': [2, 6, 1, 9]},
      {'id': 967, 'name': 'Pl. Miquel de Palol', 'code': 's268', 'details': [{'quantity': 10.97, 'element_type': 9}, {'quantity': 2364.04, 'element_type': 6}, {'quantity': 631.48, 'element_type': 4}, {'quantity': 10.72, 'element_type': 3}], 'types': [3, 6, 4, 1, 9]},
      {'id': 959, 'name': 'Pl. Miquel Santal\u00f3', 'code': 's259', 'details': [{'quantity': 2.9, 'element_type': 9}, {'quantity': 306.03, 'element_type': 4}, {'quantity': 132.88, 'element_type': 2}], 'types': [2, 4, 1, 9]},
      {'id': 975, 'name': 'Pl. Poeta Marquina', 'code': 's300', 'details': [{'quantity': 7.54, 'element_type': 9}, {'quantity': 2514.39, 'element_type': 6}], 'types': [1, 6, 9]},
      {'id': 970, 'name': 'Pl. Prudenci Bertrana', 'code': 's271', 'details': [{'quantity': 9.32, 'element_type': 9}, {'quantity': 1744.11, 'element_type': 6}, {'quantity': 680.77, 'element_type': 4}], 'types': [6, 4, 1, 9]},
      {'id': 963, 'name': 'Pl. Reina Sibil\u00b7la de Forti\u00e0', 'code': 's263', 'details': [{'quantity': 1.92, 'element_type': 9}, {'quantity': 83.15, 'element_type': 3}, {'quantity': 156.94, 'element_type': 2}], 'types': [2, 3, 1, 9]},
      {'id': 961, 'name': 'Pl. Salvador Espriu', 'code': 's261', 'details': [{'quantity': 2.82, 'element_type': 9}, {'quantity': 203.53, 'element_type': 4}, {'quantity': 200.03, 'element_type': 3}], 'types': [3, 4, 1, 9]},
      {'id': 974, 'name': 'Pl. Sta Susanna', 'code': 's287', 'details': [{'quantity': 3.6, 'element_type': 9}, {'quantity': 1198.61, 'element_type': 6}], 'types': [1, 6, 9]},
      {'id': 950, 'name': 'Pont de Tom\u00e1s de Lorenzana', 'code': '0761', 'details': [], 'types': [1]},
      {'id': 930, 'name': 'Ptge. dels Massaguer', 'code': '0374', 'details': [], 'types': [1]},
      {'id': 914, 'name': 'Rda. de Ferran Puig', 'code': '0209', 'details': [], 'types': [1]},
      {'id': 941, 'name': 'Rda. de Sant Antoni Maria Claret', 'code': '0560', 'details': [], 'types': [1]},
      {'id': 954, 'name': 'Rotonda Sta. Eug\u00e8nia / G\u00fcell', 'code': 's004', 'details': [{'quantity': 1.49, 'element_type': 9}, {'quantity': 186.17, 'element_type': 2}], 'types': [2, 9]},
      {'id': 965, 'name': 'Sant Francesc', 'code': 's266', 'details': [{'quantity': 1.19, 'element_type': 9}, {'quantity': 148.99, 'element_type': 3}], 'types': [1, 3, 9]},
      {'id': 978, 'name': 'Sta. Eug\u00e8nia - Riu G\u00fcell', 'code': 's007', 'details': [{'quantity': 4.22, 'element_type': 9}, {'quantity': 432.91, 'element_type': 8}, {'quantity': 202.97, 'element_type': 2}], 'types': [2, 8, 1, 9]},
      {'id': 907, 'name': 'Trv. del Carril', 'code': '0128', 'details': [], 'types': [1]},
      {'id': 904, 'name': 'Trv. dels Canaders', 'code': '0110', 'details': [], 'types': [1]}
    ]
  }
]

var username = 'manel.clos@ajgirona.cat'

var jobs = []
// {'id': 263, 'contract': 10, 'element_type': 2, 'element_group': 873, 'element_task': 15, 'quantity': 43.86, 'note': '3',
//  'photos': [
//    {'id': 425, 'job': 263, 'photo': 'https://server3.microdisseny.com/ajgirona/feines_proveidors/media/job/263/photo/1514366272934.jpg', 'description': 'Foto abans', 'taken_on': '2017-12-27T09:17:52.934000Z', 'photo_type': 'abans'}
//  ],
//  'created_on': '2017-12-27T09:17:15.881000Z', 'updated_on': '2017-12-27T09:18:18.056000Z', 'status': 'open'},
// {'id': 264, 'contract': 11, 'element_type': 1, 'element_group': 897, 'element_task': null, 'quantity': null, 'note': null, 'photos': [], 'created_on': '2017-12-27T09:18:50.481000Z', 'updated_on': '2017-12-27T09:18:56.424000Z', 'status': 'open'}

var elementTasks = [
  {'id': 28, 'name': 'Adobat gespa', 'types': [8, 4]},
  {'id': 8, 'name': 'Col\u00b7locaci\u00f3 de tutors', 'types': [1]},
  {'id': 11, 'name': 'Col\u00b7locaci\u00f3 fauna \u00fatil', 'types': [1]},
  {'id': 12, 'name': 'Col\u00b7locaci\u00f3 paranys per al control de plagues', 'types': [1]},
  {'id': 35, 'name': 'Desbrossat marges carrers', 'types': [7]},
  {'id': 34, 'name': 'Desherbat saul\u00f3', 'types': [6]},
  {'id': 13, 'name': 'Eliminaci\u00f3 de bosses de procession\u00e0ria', 'types': [1]},
  {'id': 16, 'name': 'Entrecavat arbustiva', 'types': [2]},
  {'id': 5, 'name': 'Entrecavat escocell', 'types': [1]},
  {'id': 21, 'name': 'Entrecavat parterre flor', 'types': [3]},
  {'id': 27, 'name': 'Escarificat gespa', 'types': [8, 4]},
  {'id': 17, 'name': 'Neteja arbustiva', 'types': [2]},
  {'id': 4, 'name': 'Neteja de rebrolls', 'types': [1]},
  {'id': 30, 'name': 'Neteja gespa', 'types': [8, 4]},
  {'id': 36, 'name': 'Neteja marges carrers', 'types': [7]},
  {'id': 22, 'name': 'Neteja parterre flor', 'types': [3]},
  {'id': 32, 'name': 'Neteja prat', 'types': [5]},
  {'id': 40, 'name': 'Netejar sector', 'types': [9]},
  {'id': 33, 'name': 'Neteja saul\u00f3', 'types': [6]},
  {'id': 18, 'name': 'Plantaci\u00f3 arbustiva', 'types': [2]},
  {'id': 7, 'name': 'Plantaci\u00f3 d\'arbres', 'types': [1]},
  {'id': 23, 'name': 'Plantaci\u00f3 parterre flor', 'types': [3]},
  {'id': 2, 'name': 'Poda d\'arbres', 'types': [1]},
  {'id': 3, 'name': 'Poda per afectacions', 'types': [1]},
  {'id': 19, 'name': 'Reg implentaci\u00f3 arbustiva', 'types': [2]},
  {'id': 24, 'name': 'Reg implentaci\u00f3 parterre flor', 'types': [3]},
  {'id': 6, 'name': 'Reg manual', 'types': [1]},
  {'id': 29, 'name': 'Resembra gespa', 'types': [8, 4]},
  {'id': 15, 'name': 'Retall arbustiva', 'types': [2]},
  {'id': 1, 'name': 'Retirada d\u2019elements morts o perillosos (escocell)', 'types': [1]},
  {'id': 38, 'name': 'Retirada d\u2019elements morts o perillosos (sense escocell)', 'types': [1]},
  {'id': 25, 'name': 'Sega amb reg', 'types': [4]},
  {'id': 31, 'name': 'Sega prat', 'types': [5]},
  {'id': 26, 'name': 'Sega sense reg', 'types': [8]},
  {'id': 14, 'name': 'Tractament de palmeres', 'types': [1]},
  {'id': 9, 'name': 'Tractament fitosanitari amb can\u00f3 (escocell)', 'types': [1]},
  {'id': 39, 'name': 'Tractament fitosanitari amb can\u00f3 (sense escocell)', 'types': [1]},
  {'id': 10, 'name': 'Tractament fitosanitari amb endoter\u00e0pia', 'types': [1]},
  {'id': 20, 'name': 'Tractament fitosanitari amb motxilla', 'types': [2]}
]

export default {
  activate: function () {
    console.log('Mocking remote API')

    // This sets the mock adapter on the default instance
    var mock = new MockAdapter(axios)

    mock.onPost(
      Vue.API_ROOT + '/ajgirona/feines_proveidors/o/token/'
    ).reply(function (config) {
      for (var pair of config.data.entries()) {
        console.log('form data:', pair[0] + ', ' + pair[1])
      }
      let password = config.data.get('password')

      if (password === 'goodpassword') {
        return [200, {
          'token_type': 'Bearer',
          'scope': 'read write',
          'refresh_token': 'pMlCZzn37yBOI4oxQb66aRZeU14W61',
          'expires_in': 315360000,
          'access_token': 'aczsGCgoTETcxEP8kvCz9RGslWf1Ug'
        }]
      }
      else {
        return [401, {
          'error_description': 'Invalid credentials given.',
          'error': 'invalid_grant'
        }]
      }
    })

    mock.onGet(
      Vue.API_ROOT + '/ajgirona/feines_proveidors/startup'
    ).reply(function (config) {
      return [200, {
        'element_types': elementTypes,
        'contracts': contracts,
        'username': username,
        'jobs': jobs,
        'element_tasks': elementTasks
      }]
    })

    // mock.onPost(
    //   Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobs/'
    // ).reply(
    //
    // )

    // catch-all
    mock.onAny().reply(function (config) {
      console.log('URL not handled:', config.method, config.url)
      if (config.data instanceof FormData) {
        for (var pair of config.data.entries()) {
          console.log('form data:', pair[0] + ', ' + pair[1])
        }
      }
      else {
        console.log('DATA:', config.data)
      }
      return [404, {}]
    })
  }
}
