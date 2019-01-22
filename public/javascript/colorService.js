function VueColor(colorName) {
  function getTextColor(color) {
    color = (color.charAt(0) === '#') ? color.substring(1, 7) : color
    let lightBackground = !!Math.round(
      (
        parseInt(color.substring(0, 2), 16) + // hexToR
        parseInt(color.substring(2, 4), 16) + // hexToG
        parseInt(color.substring(4, 6), 16) // hexToB
      ) / 765 // 255 * 3, average and normalize to 1
    )
    return lightBackground ? '#000000' : '#FFFFFF'
  }
  function randomAccent(alias) {
    let accent = accents[randomIndex(accents)]
    accent.aliases.push(alias)
    return accent
  }
  function darkAccent(alias) {
    const darkAccents = accents.filter(x => x.isDark)
    let accent
    if (darkAccents) {
      accent = darkAccents[randomIndex(darkAccents)]
      if (!accent) {
        console.log(alias, darkAccents)
      }
      accent.aliases.push(alias)
    }
    return accent
  }
  function lightAccent(alias) {
    const lightAccents = accents.filter(x => !x.isDark)
    let accent
    if (lightAccents) {
      accent = lightAccents[randomIndex(lightAccents)]
      accent.aliases.push(alias)
    }
    return accent
  }
  function accentByAlias(alias, lightness) {
    let accent = accents.find(x => x.aliases.indexOf(alias) >= 0)
    if (!accent) {
      if (lightness === 'light') {
        accent = lightAccent(alias)
      } else if (lightness === 'dark') {
        accent = darkAccent(alias)
      } else {
        accent = randomAccent(alias)
      }
    }
    return accent
  }
  const accents = []
  const colorAccentIndex = [
    '',
    'lighten-5',
    'lighten-4',
    'lighten-3',
    'lighten-2',
    'lighten-1',
    'darken-1',
    'darken-2',
    'darken-3',
    'darken-4',
    'accent-1',
    'accent-2',
    'accent-3',
    'accent-4'
  ]
  for (let i = 0; i < colors[colorName].length; i++) {
    let color = colors[colorName][i]
    const textColor = getTextColor(color)
    const colorAlias = colorName + (i ? ' ' + colorAccentIndex[i] : '')
    const textClass = (textColor === '#000000' ? 'black--text' : 'white--text')
    const isDark = textColor === '#FFFFFF'
    let accent = {
      color: color,
      isDark,
      textColor: textColor,
      vuetify: {
        color: colorAlias,
        textClass: textClass
      },
      aliases: []
    }
    accents.push(accent)
  }
  return {
    vAccent: function (alias) {
      return accentByAlias(alias).vuetify
    },
    vLightAccent: function (alias) {
      return accentByAlias(alias, 'light').vuetify
    },
    vDarkAccent: function (alias) {
      return accentByAlias(alias, 'dark').vuetify
    },
    accent: accentByAlias,
    lightAccent: function (alias) {
      return accentByAlias(alias, 'light')
    },
    darkAccent: function (alias) {
      return accentByAlias(alias, 'dark')
    }
  }
}
function randomIndex(list, max) {
  const limit = max || list.length
  return Math.floor(Math.random() * limit)
}
function randomKey(object) {
  return Object.keys(object)[Math.floor(Math.random() * Object.keys(object).length)]
}
function createNamedService(colorName, serviceName) {
  let index = randomKey(colors)
  let vColor
  if (colorName !== undefined) {
    if (colors[colorName]) {
      index = colorName
    }
  }
  vColor = new VueColor(index)
  if (serviceName) {
    services[serviceName] = vColor
  }
  return vColor
}
function ColorService(colorName, serviceName) {
  let service = services[serviceName]
  if (!service) {
    service = createNamedService(colorName, serviceName)
  }
  return service
}
const colors = {
  red: [
    '#F44336',
    '#FFEBEE',
    '#FFCDD2',
    '#EF9A9A',
    '#E57373',
    '#EF5350',
    '#E53935',
    '#D32F2F',
    '#C62828',
    '#B71C1C',
    '#FF8A80',
    '#FF5252',
    '#FF1744',
    '#D50000'
  ],
  pink: [
    '#E91E63',
    '#FCE4EC',
    '#F8BBD0',
    '#F48FB1',
    '#F06292',
    '#EC407A',
    '#D81B60',
    '#C2185B',
    '#AD1457',
    '#880E4',
    '#FF80AB',
    '#FF4081',
    '#F50057',
    '#C51162'
  ],
  purple: [
    '#9C27B0',
    '#F3E5F5',
    '#E1BEE7',
    '#CE93D8',
    '#BA68C8',
    '#AB47BC',
    '#8E24AA',
    '#7B1FA2',
    '#6A1B9A',
    '#4A148C',
    '#EA80FC',
    '#E040FB',
    '#D500F9',
    '#AA00FF'
  ],
  'deep-purple': [
    '#673AB7',
    '#EDE7F6',
    '#D1C4E9',
    '#B39DDB',
    '#9575CD',
    '#7E57C2',
    '#5E35B1',
    '#512DA8',
    '#4527A0',
    '#311B92',
    '#B388FF',
    '#7C4DFF',
    '#651FFF',
    '#6200EA'
  ],
  indigo: [
    '#3F51B5',
    '#E8EAF6',
    '#C5CAE9',
    '#9FA8DA',
    '#7986CB',
    '#5C6BC0',
    '#3949AB',
    '#303F9F',
    '#283593',
    '#1A237E',
    '#8C9EFF',
    '#536DFE',
    '#3D5AFE',
    '#304FFE'
  ],
  blue: [
    '#2196F3',
    '#E3F2FD',
    '#BBDEFB',
    '#90CAF9',
    '#64B5F6',
    '#42A5F5',
    '#1E88E5',
    '#1976D2',
    '#1565C0',
    '#0D47A1',
    '#82B1FF',
    '#448AFF',
    '#2979FF',
    '#2962FF'
  ],
  'light-blue': [
    '#03A9F4',
    '#E1F5FE',
    '#B3E5FC',
    '#81D4FA',
    '#4FC3F7',
    '#29B6F6',
    '#039BE5',
    '#0288D1',
    '#0277BD',
    '#01579B',
    '#80D8FF',
    '#40C4FF',
    '#00B0FF',
    '#0091EA'
  ],
  cyan: [
    '#00BCD4',
    '#E0F7FA',
    '#B2EBF2',
    '#80DEEA',
    '#4DD0E1',
    '#26C6DA',
    '#00ACC1',
    '#0097A7',
    '#00838F',
    '#006064',
    '#84FFFF',
    '#18FFFF',
    '#00E5FF',
    '#00B8D4'
  ],
  teal: [
    '#009688',
    '#E0F2F1',
    '#B2DFDB',
    '#80CBC4',
    '#4DB6AC',
    '#26A69A',
    '#00897B',
    '#00796B',
    '#00695C',
    '#004D40',
    '#A7FFEB',
    '#64FFDA',
    '#1DE9B6',
    '#00BFA5'
  ],
  green: [
    '#4CAF50',
    '#E8F5E9',
    '#C8E6C9',
    '#A5D6A7',
    '#81C784',
    '#66BB6A',
    '#43A047',
    '#388E3C',
    '#2E7D32',
    '#1B5E20',
    '#B9F6CA',
    '#69F0AE',
    '#00E676',
    '#00C853'
  ],
  'light-green': [
    '#8BC34A',
    '#F1F8E9',
    '#DCEDC8',
    '#C5E1A5',
    '#AED581',
    '#9CCC65',
    '#7CB342',
    '#689F38',
    '#558B2F',
    '#33691E',
    '#CCFF90',
    '#B2FF59',
    '#76FF03',
    '#64DD17'
  ],
  lime: [
    '#CDDC39',
    '#F9FBE7',
    '#F0F4C3',
    '#E6EE9C',
    '#DCE775',
    '#D4E157',
    '#C0CA33',
    '#AFB42B',
    '#9E9D24',
    '#827717',
    '#F4FF81',
    '#EEFF41',
    '#C6FF00',
    '#AEEA00'
  ],
  yellow: [
    '#FFEB3B',
    '#FFFDE7',
    '#FFF9C4',
    '#FFF59D',
    '#FFF176',
    '#FFEE58',
    '#FDD835',
    '#FBC02D',
    '#F9A825',
    '#F57F17',
    '#FFFF8D',
    '#FFFF00',
    '#FFEA00',
    '#FFD600'
  ],
  amber: [
    '#FFC107',
    '#FFF8E1',
    '#FFECB3',
    '#FFE082',
    '#FFD54F',
    '#FFCA28',
    '#FFB300',
    '#FFA000',
    '#FF8F00',
    '#FF6F00',
    '#FFE57F',
    '#FFD740',
    '#FFC400',
    '#FFAB00'
  ],
  orange: [
    '#FF9800',
    '#FFF3E0',
    '#FFE0B2',
    '#FFCC80',
    '#FFB74D',
    '#FFA726',
    '#FB8C00',
    '#F57C00',
    '#EF6C00',
    '#E65100',
    '#FFD180',
    '#FFAB40',
    '#FF9100',
    '#FF6D00'
  ],
  'deep-orange': [
    '#FF5722',
    '#FBE9E7',
    '#FFCCBC',
    '#FFAB91',
    '#FF8A65',
    '#FF7043',
    '#F4511E',
    '#E64A19',
    '#D84315',
    '#BF360C',
    '#FF9E80',
    '#FF6E40',
    '#FF3D00',
    '#DD2C00'
  ],
  brown: [
    '#795548',
    '#EFEBE9',
    '#D7CCC8',
    '#BCAAA4',
    '#A1887F',
    '#8D6E63',
    '#6D4C41',
    '#5D4037',
    '#4E342E',
    '#3E2723'
  ],
  'blue-grey': [
    '#607D8B',
    '#ECEFF1',
    '#CFD8DC',
    '#B0BEC5',
    '#90A4AE',
    '#78909C',
    '#546E7A',
    '#455A64',
    '#37474F',
    '#263238'
  ],
  grey: [
    '#9E9E9E',
    '#FAFAFA',
    '#F5F5F5',
    '#EEEEEE',
    '#E0E0E0',
    '#BDBDBD',
    '#757575',
    '#616161',
    '#424242',
    '#212121'
  ]
}
let services = {}
export default ColorService

