// Species taxonomy data based on:
// Birds: International Ornithological Congress (IOC) - https://www.worldbirdnames.org/new/classification/orders-of-birds-draft/
// Mammals: Mammal Diversity Database - https://www.mammaldiversity.org

const speciesTaxonomy = {
  birds: {
    "Passeriformes": {
      "Passeridae": {
        "Passer": {
          "Passer domesticus": {
            commonName: "House Sparrow",
            scientificName: "Passer domesticus",
            family: "Passeridae",
            order: "Passeriformes",
            class: "Aves",
            description: "A small bird with brown and gray plumage, commonly found in urban areas."
          },
          "Passer montanus": {
            commonName: "Eurasian Tree Sparrow",
            scientificName: "Passer montanus",
            family: "Passeridae",
            order: "Passeriformes",
            class: "Aves",
            description: "Similar to house sparrow but with distinctive black cheek patches."
          }
        }
      },
      "Corvidae": {
        "Corvus": {
          "Corvus corax": {
            commonName: "Common Raven",
            scientificName: "Corvus corax",
            family: "Corvidae",
            order: "Passeriformes",
            class: "Aves",
            description: "Large, intelligent black bird with a deep croaking call."
          },
          "Corvus brachyrhynchos": {
            commonName: "American Crow",
            scientificName: "Corvus brachyrhynchos",
            family: "Corvidae",
            order: "Passeriformes",
            class: "Aves",
            description: "Medium-sized black bird with a distinctive cawing call."
          }
        }
      }
    },
    "Accipitriformes": {
      "Accipitridae": {
        "Haliaeetus": {
          "Haliaeetus leucocephalus": {
            commonName: "Bald Eagle",
            scientificName: "Haliaeetus leucocephalus",
            family: "Accipitridae",
            order: "Accipitriformes",
            class: "Aves",
            description: "Large bird of prey with white head and tail, national bird of the United States."
          }
        },
        "Accipiter": {
          "Accipiter cooperii": {
            commonName: "Cooper's Hawk",
            scientificName: "Accipiter cooperii",
            family: "Accipitridae",
            order: "Accipitriformes",
            class: "Aves",
            description: "Medium-sized hawk with rounded wings and long tail."
          }
        }
      }
    },
    "Strigiformes": {
      "Strigidae": {
        "Bubo": {
          "Bubo virginianus": {
            commonName: "Great Horned Owl",
            scientificName: "Bubo virginianus",
            family: "Strigidae",
            order: "Strigiformes",
            class: "Aves",
            description: "Large owl with prominent ear tufts and deep hooting call."
          }
        }
      }
    }
  },
  mammals: {
    "Carnivora": {
      "Canidae": {
        "Canis": {
          "Canis lupus": {
            commonName: "Gray Wolf",
            scientificName: "Canis lupus",
            family: "Canidae",
            order: "Carnivora",
            class: "Mammalia",
            description: "Large carnivorous mammal, ancestor of domestic dogs."
          },
          "Canis latrans": {
            commonName: "Coyote",
            scientificName: "Canis latrans",
            family: "Canidae",
            order: "Carnivora",
            class: "Mammalia",
            description: "Medium-sized canid native to North America."
          }
        },
        "Vulpes": {
          "Vulpes vulpes": {
            commonName: "Red Fox",
            scientificName: "Vulpes vulpes",
            family: "Canidae",
            order: "Carnivora",
            class: "Mammalia",
            description: "Small to medium-sized fox with reddish fur."
          }
        }
      },
      "Felidae": {
        "Felis": {
          "Felis catus": {
            commonName: "Domestic Cat",
            scientificName: "Felis catus",
            family: "Felidae",
            order: "Carnivora",
            class: "Mammalia",
            description: "Small carnivorous mammal, commonly kept as a pet."
          }
        },
        "Panthera": {
          "Panthera leo": {
            commonName: "Lion",
            scientificName: "Panthera leo",
            family: "Felidae",
            order: "Carnivora",
            class: "Mammalia",
            description: "Large cat species, known as the 'king of the jungle'."
          }
        }
      }
    },
    "Artiodactyla": {
      "Cervidae": {
        "Cervus": {
          "Cervus elaphus": {
            commonName: "Red Deer",
            scientificName: "Cervus elaphus",
            family: "Cervidae",
            order: "Artiodactyla",
            class: "Mammalia",
            description: "Large deer species with impressive antlers."
          }
        },
        "Odocoileus": {
          "Odocoileus virginianus": {
            commonName: "White-tailed Deer",
            scientificName: "Odocoileus virginianus",
            family: "Cervidae",
            order: "Artiodactyla",
            class: "Mammalia",
            description: "Medium-sized deer native to the Americas."
          }
        }
      }
    },
    "Primates": {
      "Hominidae": {
        "Homo": {
          "Homo sapiens": {
            commonName: "Human",
            scientificName: "Homo sapiens",
            family: "Hominidae",
            order: "Primates",
            class: "Mammalia",
            description: "The only extant species of the genus Homo."
          }
        }
      }
    }
  }
};

// Helper functions to work with taxonomy data
const getSpeciesByClass = (className) => {
  return speciesTaxonomy[className] || {};
};

const getSpeciesByOrder = (className, orderName) => {
  const classData = getSpeciesByClass(className);
  return classData[orderName] || {};
};

const getSpeciesByFamily = (className, orderName, familyName) => {
  const orderData = getSpeciesByOrder(className, orderName);
  return orderData[familyName] || {};
};

const getAllSpecies = () => {
  const allSpecies = [];
  
  for (const className in speciesTaxonomy) {
    for (const orderName in speciesTaxonomy[className]) {
      for (const familyName in speciesTaxonomy[className][orderName]) {
        for (const genusName in speciesTaxonomy[className][orderName][familyName]) {
          for (const speciesName in speciesTaxonomy[className][orderName][familyName][genusName]) {
            allSpecies.push({
              scientificName: speciesName,
              ...speciesTaxonomy[className][orderName][familyName][genusName][speciesName]
            });
          }
        }
      }
    }
  }
  
  return allSpecies;
};

const getSpeciesByScientificName = (scientificName) => {
  const allSpecies = getAllSpecies();
  return allSpecies.find(species => species.scientificName === scientificName);
};

const searchSpecies = (query) => {
  const allSpecies = getAllSpecies();
  const lowercaseQuery = query.toLowerCase();
  
  return allSpecies.filter(species => 
    species.commonName.toLowerCase().includes(lowercaseQuery) ||
    species.scientificName.toLowerCase().includes(lowercaseQuery) ||
    species.family.toLowerCase().includes(lowercaseQuery) ||
    species.order.toLowerCase().includes(lowercaseQuery)
  );
};

module.exports = {
  speciesTaxonomy,
  getSpeciesByClass,
  getSpeciesByOrder,
  getSpeciesByFamily,
  getAllSpecies,
  getSpeciesByScientificName,
  searchSpecies
};
