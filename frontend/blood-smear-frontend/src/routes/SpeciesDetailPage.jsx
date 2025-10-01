import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import './SpeciesDetailPage.css';

// Dummy species data based on IOC World Bird List classification
const dummySpeciesData = {
  "Passer domesticus": {
    scientificName: "Passer domesticus",
    commonName: "House Sparrow",
    family: "Passeridae",
    order: "Passeriformes",
    class: "Aves",
    description: "A small bird with brown and gray plumage, commonly found in urban areas worldwide. House sparrows are highly social birds that nest in colonies and are known for their adaptability to human environments.",
  },
  "Corvus corax": {
    scientificName: "Corvus corax",
    commonName: "Common Raven",
    family: "Corvidae",
    order: "Passeriformes",
    class: "Aves",
    description: "Large, intelligent black bird with a deep croaking call, known for problem-solving abilities. Ravens are among the most intelligent birds and have complex social behaviors.",
  },
  "Haliaeetus leucocephalus": {
    scientificName: "Haliaeetus leucocephalus",
    commonName: "Bald Eagle",
    family: "Accipitridae",
    order: "Accipitriformes",
    class: "Aves",
    description: "Large bird of prey with white head and tail, national bird of the United States. Bald eagles are powerful hunters and symbols of freedom and strength.",
  },
  "Bubo virginianus": {
    scientificName: "Bubo virginianus",
    commonName: "Great Horned Owl",
    family: "Strigidae",
    order: "Strigiformes",
    class: "Aves",
    description: "Large owl with prominent ear tufts and deep hooting call, widespread across North America. These powerful predators are known for their exceptional night vision and silent flight."
  },
  "Anas platyrhynchos": {
    scientificName: "Anas platyrhynchos",
    commonName: "Mallard",
    family: "Anatidae",
    order: "Anseriformes",
    class: "Aves",
    description: "Familiar dabbling duck with iridescent green head in males, widespread across the Northern Hemisphere. Mallards are the ancestor of most domestic duck breeds."
  },
  "Falco peregrinus": {
    scientificName: "Falco peregrinus",
    commonName: "Peregrine Falcon",
    family: "Falconidae",
    order: "Falconiformes",
    class: "Aves",
    description: "Fastest bird in the world, capable of diving speeds over 200 mph, cosmopolitan distribution. Peregrine falcons are apex predators that hunt other birds in spectacular aerial dives."
  },
  "Canis lupus": {
    scientificName: "Canis lupus",
    commonName: "Gray Wolf",
    family: "Canidae",
    order: "Carnivora",
    class: "Mammalia",
    description: "Large carnivorous mammal, ancestor of domestic dogs, lives in packs with complex social structure. Gray wolves are apex predators that play a crucial role in maintaining ecosystem balance.",
  },
  "Struthio camelus": {
    scientificName: "Struthio camelus",
    commonName: "Common Ostrich",
    family: "Struthionidae",
    order: "Struthioniformes",
    class: "Aves",
    description: "The largest living bird, flightless with long legs and neck, native to Africa. Ostriches are the fastest running birds and can reach speeds of up to 70 km/h.",
  },
  "Rhea americana": {
    scientificName: "Rhea americana",
    commonName: "Greater Rhea",
    family: "Rheidae",
    order: "Rheiformes",
    class: "Aves",
    description: "Large flightless bird from South America, similar to ostrich but smaller. Greater rheas are excellent runners and can reach speeds of up to 60 km/h.",
  },
  "Apteryx australis": {
    scientificName: "Apteryx australis",
    commonName: "Southern Brown Kiwi",
    family: "Apterygidae",
    order: "Apterygiformes",
    class: "Aves",
    description: "Small flightless bird from New Zealand with long beak and nocturnal habits. Kiwis are unique among birds for having nostrils at the tip of their beak.",
  },
  "Dromaius novaehollandiae": {
    scientificName: "Dromaius novaehollandiae",
    commonName: "Emu",
    family: "Casuariidae",
    order: "Casuariiformes",
    class: "Aves",
    description: "Large flightless bird from Australia, second tallest bird after ostrich. Emus are excellent swimmers and can run at speeds of up to 50 km/h.",
  },
  "Tinamus major": {
    scientificName: "Tinamus major",
    commonName: "Great Tinamou",
    family: "Tinamidae",
    order: "Tinamiformes",
    class: "Aves",
    description: "Ground-dwelling bird from Central and South America, related to ratites. Great tinamous are known for their distinctive calls and cryptic plumage.",
  },
  "Phasianus colchicus": {
    scientificName: "Phasianus colchicus",
    commonName: "Ring-necked Pheasant",
    family: "Phasianidae",
    order: "Galliformes",
    class: "Aves",
    description: "Colorful game bird with long tail, introduced to North America from Asia. Ring-necked pheasants are popular game birds and are known for their elaborate courtship displays.",
  },
  "Colinus virginianus": {
    scientificName: "Colinus virginianus",
    commonName: "Northern Bobwhite",
    family: "Phasianidae",
    order: "Galliformes",
    class: "Aves",
    description: "Small quail with distinctive 'bob-white' call, common in grasslands. Northern bobwhites are popular game birds and are known for their covey behavior.",
  },
  "Anas platyrhynchos": {
    scientificName: "Anas platyrhynchos",
    commonName: "Mallard",
    family: "Anatidae",
    order: "Anseriformes",
    class: "Aves",
    description: "Familiar dabbling duck with iridescent green head in males. Mallards are the ancestor of most domestic duck breeds and are found worldwide.",
  },
  "Branta canadensis": {
    scientificName: "Branta canadensis",
    commonName: "Canada Goose",
    family: "Anatidae",
    order: "Anseriformes",
    class: "Aves",
    description: "Large goose with black head and neck, white cheek patch. Canada geese are known for their V-formation flight and are found throughout North America.",
  }
};

// Dummy blood smear data
const dummyBloodSmearData = {
  "Passer domesticus": [
    {
      _id: "1",
      jobId: "job_001",
      commonName: "House Sparrow",
      scientificName: "Passer domesticus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Veterinary Medicine",
      collectedAt: "2024-01-15T10:30:00Z",
      source: "Wild specimen",
      createdAt: "2024-01-15T11:00:00Z"
    },
    {
      _id: "2",
      jobId: "job_002",
      commonName: "House Sparrow",
      scientificName: "Passer domesticus",
      healthStatus: "Mild anemia",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Veterinary Medicine",
      collectedAt: "2024-02-10T14:20:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-10T15:00:00Z"
    }
  ],
  "Corvus corax": [
    {
      _id: "5",
      jobId: "job_005",
      commonName: "Common Raven",
      scientificName: "Corvus corax",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-01-25T11:30:00Z",
      source: "Wild specimen",
      createdAt: "2024-01-25T12:00:00Z"
    }
  ],
  "Haliaeetus leucocephalus": [
    {
      _id: "4",
      jobId: "job_004",
      commonName: "Bald Eagle",
      scientificName: "Haliaeetus leucocephalus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Raptor Center",
      collectedAt: "2024-02-05T13:45:00Z",
      source: "Rehabilitation center",
      createdAt: "2024-02-05T14:30:00Z"
    }
  ],
  "Bubo virginianus": [
    {
      _id: "6",
      jobId: "job_006",
      commonName: "Great Horned Owl",
      scientificName: "Bubo virginianus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Raptor Center",
      collectedAt: "2024-02-12T16:20:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-12T17:00:00Z"
    }
  ],
  "Anas platyrhynchos": [
    {
      _id: "7",
      jobId: "job_007",
      commonName: "Mallard",
      scientificName: "Anas platyrhynchos",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-02-18T09:45:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-18T10:30:00Z"
    }
  ],
  "Falco peregrinus": [
    {
      _id: "8",
      jobId: "job_008",
      commonName: "Peregrine Falcon",
      scientificName: "Falco peregrinus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Raptor Center",
      collectedAt: "2024-02-20T14:15:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-20T15:00:00Z"
    }
  ],
  "Canis lupus": [
    {
      _id: "3",
      jobId: "job_003",
      commonName: "Gray Wolf",
      scientificName: "Canis lupus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-01-20T09:15:00Z",
      source: "Captive specimen",
      createdAt: "2024-01-20T10:00:00Z"
    }
  ],
  "Struthio camelus": [
    {
      _id: "9",
      jobId: "job_009",
      commonName: "Common Ostrich",
      scientificName: "Struthio camelus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-02-25T11:30:00Z",
      source: "Captive specimen",
      createdAt: "2024-02-25T12:00:00Z"
    }
  ],
  "Rhea americana": [
    {
      _id: "10",
      jobId: "job_010",
      commonName: "Greater Rhea",
      scientificName: "Rhea americana",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-02-28T14:45:00Z",
      source: "Captive specimen",
      createdAt: "2024-02-28T15:30:00Z"
    }
  ],
  "Apteryx australis": [
    {
      _id: "11",
      jobId: "job_011",
      commonName: "Southern Brown Kiwi",
      scientificName: "Apteryx australis",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-02T16:20:00Z",
      source: "Captive specimen",
      createdAt: "2024-03-02T17:00:00Z"
    }
  ],
  "Dromaius novaehollandiae": [
    {
      _id: "12",
      jobId: "job_012",
      commonName: "Emu",
      scientificName: "Dromaius novaehollandiae",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-05T10:15:00Z",
      source: "Captive specimen",
      createdAt: "2024-03-05T11:00:00Z"
    }
  ],
  "Phasianus colchicus": [
    {
      _id: "13",
      jobId: "job_013",
      commonName: "Ring-necked Pheasant",
      scientificName: "Phasianus colchicus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-08T13:30:00Z",
      source: "Wild specimen",
      createdAt: "2024-03-08T14:15:00Z"
    }
  ],
  "Anas platyrhynchos": [
    {
      _id: "14",
      jobId: "job_014",
      commonName: "Mallard",
      scientificName: "Anas platyrhynchos",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-10T09:45:00Z",
      source: "Wild specimen",
      createdAt: "2024-03-10T10:30:00Z"
    }
  ],
  "Branta canadensis": [
    {
      _id: "15",
      jobId: "job_015",
      commonName: "Canada Goose",
      scientificName: "Branta canadensis",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-12T12:00:00Z",
      source: "Wild specimen",
      createdAt: "2024-03-12T12:45:00Z"
    }
  ]
};

// Dummy image data
const dummyImageData = {
  "job_001": {
    species: dummySpeciesData["Passer domesticus"],
    record: {
      id: "1",
      jobId: "job_001",
      commonName: "House Sparrow",
      scientificName: "Passer domesticus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Veterinary Medicine",
      collectedAt: "2024-01-15T10:30:00Z",
      source: "Wild specimen",
      createdAt: "2024-01-15T11:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1",
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+2"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1",
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+2"
        ],
        "Erythrocyte": [
          "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=Erythrocyte+1"
        ]
      }
    }
  },
  "job_002": {
    species: dummySpeciesData["Passer domesticus"],
    record: {
      id: "2",
      jobId: "job_002",
      commonName: "House Sparrow",
      scientificName: "Passer domesticus",
      healthStatus: "Mild anemia",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Veterinary Medicine",
      collectedAt: "2024-02-10T14:20:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-10T15:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/50E3C2/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1",
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+2"
        ]
      }
    }
  },
  "job_003": {
    species: dummySpeciesData["Canis lupus"],
    record: {
      id: "3",
      jobId: "job_003",
      commonName: "Gray Wolf",
      scientificName: "Canis lupus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-01-20T09:15:00Z",
      source: "Captive specimen",
      createdAt: "2024-01-20T10:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/9013FE/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1",
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+2"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Monocyte": [
          "https://via.placeholder.com/300x300/BD10E0/FFFFFF?text=Monocyte+1"
        ]
      }
    }
  },
  "job_004": {
    species: dummySpeciesData["Haliaeetus leucocephalus"],
    record: {
      id: "4",
      jobId: "job_004",
      commonName: "Bald Eagle",
      scientificName: "Haliaeetus leucocephalus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Raptor Center",
      collectedAt: "2024-02-05T13:45:00Z",
      source: "Rehabilitation center",
      createdAt: "2024-02-05T14:30:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/B8E986/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1",
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+2"
        ],
        "Eosinophil": [
          "https://via.placeholder.com/300x300/417505/FFFFFF?text=Eosinophil+1"
        ]
      }
    }
  },
  "job_005": {
    species: dummySpeciesData["Corvus corax"],
    record: {
      id: "5",
      jobId: "job_005",
      commonName: "Common Raven",
      scientificName: "Corvus corax",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-01-25T11:30:00Z",
      source: "Wild specimen",
      createdAt: "2024-01-25T12:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/2C3E50/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1",
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+2"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Monocyte": [
          "https://via.placeholder.com/300x300/BD10E0/FFFFFF?text=Monocyte+1"
        ]
      }
    }
  },
  "job_006": {
    species: dummySpeciesData["Bubo virginianus"],
    record: {
      id: "6",
      jobId: "job_006",
      commonName: "Great Horned Owl",
      scientificName: "Bubo virginianus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Raptor Center",
      collectedAt: "2024-02-12T16:20:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-12T17:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/8E44AD/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1",
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+2"
        ],
        "Eosinophil": [
          "https://via.placeholder.com/300x300/417505/FFFFFF?text=Eosinophil+1"
        ]
      }
    }
  },
  "job_007": {
    species: dummySpeciesData["Anas platyrhynchos"],
    record: {
      id: "7",
      jobId: "job_007",
      commonName: "Mallard",
      scientificName: "Anas platyrhynchos",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-02-18T09:45:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-18T10:30:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/3498DB/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1",
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+2"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Erythrocyte": [
          "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=Erythrocyte+1"
        ]
      }
    }
  },
  "job_008": {
    species: dummySpeciesData["Falco peregrinus"],
    record: {
      id: "8",
      jobId: "job_008",
      commonName: "Peregrine Falcon",
      scientificName: "Falco peregrinus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Raptor Center",
      collectedAt: "2024-02-20T14:15:00Z",
      source: "Wild specimen",
      createdAt: "2024-02-20T15:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/E74C3C/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1",
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+2"
        ],
        "Eosinophil": [
          "https://via.placeholder.com/300x300/417505/FFFFFF?text=Eosinophil+1"
        ]
      }
    }
  },
  "job_009": {
    species: dummySpeciesData["Struthio camelus"],
    record: {
      id: "9",
      jobId: "job_009",
      commonName: "Common Ostrich",
      scientificName: "Struthio camelus",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-02-25T11:30:00Z",
      source: "Captive specimen",
      createdAt: "2024-02-25T12:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/8E44AD/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Erythrocyte": [
          "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=Erythrocyte+1"
        ]
      }
    }
  },
  "job_010": {
    species: dummySpeciesData["Rhea americana"],
    record: {
      id: "10",
      jobId: "job_010",
      commonName: "Greater Rhea",
      scientificName: "Rhea americana",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-02-28T14:45:00Z",
      source: "Captive specimen",
      createdAt: "2024-02-28T15:30:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/3498DB/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Monocyte": [
          "https://via.placeholder.com/300x300/BD10E0/FFFFFF?text=Monocyte+1"
        ]
      }
    }
  },
  "job_011": {
    species: dummySpeciesData["Apteryx australis"],
    record: {
      id: "11",
      jobId: "job_011",
      commonName: "Southern Brown Kiwi",
      scientificName: "Apteryx australis",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-02T16:20:00Z",
      source: "Captive specimen",
      createdAt: "2024-03-02T17:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/2ECC71/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Erythrocyte": [
          "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=Erythrocyte+1"
        ]
      }
    }
  },
  "job_012": {
    species: dummySpeciesData["Dromaius novaehollandiae"],
    record: {
      id: "12",
      jobId: "job_012",
      commonName: "Emu",
      scientificName: "Dromaius novaehollandiae",
      healthStatus: "Healthy",
      stain: "Wright-Giemsa",
      contributor: "UC Davis Wildlife Health Center",
      collectedAt: "2024-03-05T10:15:00Z",
      source: "Captive specimen",
      createdAt: "2024-03-05T11:00:00Z"
    },
    images: {
      wholeSlideImage: "https://via.placeholder.com/800x600/E67E22/FFFFFF?text=Whole+Slide+Image",
      cellavisionImages: {
        "Lymphocyte": [
          "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Lymphocyte+1"
        ],
        "Neutrophil": [
          "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Neutrophil+1"
        ],
        "Eosinophil": [
          "https://via.placeholder.com/300x300/417505/FFFFFF?text=Eosinophil+1"
        ]
      }
    }
  }
};

const SpeciesDetailPage = () => {
  const { scientificName } = useParams();
  const [speciesData, setSpeciesData] = useState(null);
  const [bloodSmearData, setBloodSmearData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (scientificName) {
      fetchSpeciesData();
    }
  }, [scientificName]);

  const fetchSpeciesData = async () => {
    try {
      setLoading(true);
      const decodedName = decodeURIComponent(scientificName);
      
      // Simulate API call with dummy data
      setTimeout(() => {
        const species = dummySpeciesData[decodedName];
        const bloodSmear = dummyBloodSmearData[decodedName] || [];
        
        if (species) {
          setSpeciesData(species);
          setBloodSmearData(bloodSmear);
        } else {
          setError('Species not found');
        }
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Failed to fetch species data');
      console.error('Error fetching species data:', err);
      setLoading(false);
    }
  };

  const fetchRecordDetails = async (jobId) => {
    try {
      // Simulate API call with dummy data
      setTimeout(() => {
        const recordData = dummyImageData[jobId];
        if (recordData) {
          setSelectedRecord(recordData);
        } else {
          console.error('Record not found');
        }
      }, 500);
    } catch (err) {
      console.error('Error fetching record details:', err);
    }
  };

  const openImageModal = (imageUrl, imageType, cellType = null) => {
    setSelectedImage({
      url: imageUrl,
      type: imageType,
      cellType: cellType
    });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="species-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading species data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="species-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/species" className="back-button">
            ← Back to Species List
          </Link>
        </div>
      </div>
    );
  }

  if (!speciesData) {
    return (
      <div className="species-detail-page">
        <div className="error-container">
          <h2>Species Not Found</h2>
          <p>The requested species could not be found.</p>
          <Link to="/species" className="back-button">
            ← Back to Species List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="species-detail-page">
      <UCDavisNavbar />
      <div className="breadcrumb">
        <Link to="/species">Species Explorer</Link>
        <span> → </span>
        <span>{speciesData.commonName}</span>
      </div>

      <div className="species-header">
        <div className="species-title">
          <h1>{speciesData.commonName}</h1>
          <p className="scientific-name">
            <em>{speciesData.scientificName}</em>
          </p>
        </div>
        
        <div className="species-taxonomy">
          <div className="taxonomy-breadcrumb">
            <span className="taxonomy-link">{speciesData.class}</span>
            <span className="taxonomy-separator">→</span>
            <span className="taxonomy-link">{speciesData.order}</span>
            <span className="taxonomy-separator">→</span>
            <span className="taxonomy-link">{speciesData.family}</span>
          </div>
        </div>
      </div>

      {speciesData.description && (
        <div className="species-description">
          <h3>Description</h3>
          <p>{speciesData.description}</p>
        </div>
      )}

      <div className="blood-smear-section">
        <h2>Blood Smear Data</h2>
        
        {bloodSmearData.length === 0 ? (
          <div className="no-data">
            <p>No blood smear data available for this species yet.</p>
          </div>
        ) : (
          <div className="records-grid">
            {bloodSmearData.map((record) => (
              <div key={record._id} className="record-card">
                <div className="record-header">
                  <h4>Blood Smear Record</h4>
                  <span className="record-date">
                    {formatDate(record.createdAt)}
                  </span>
                </div>
                
                <div className="record-details">
                  <div className="detail-item">
                    <span className="detail-label">Health Status:</span>
                    <span className="detail-value">{record.healthStatus}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Stain:</span>
                    <span className="detail-value">{record.stain}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contributor:</span>
                    <span className="detail-value">{record.contributor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Collected:</span>
                    <span className="detail-value">{formatDate(record.collectedAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source:</span>
                    <span className="detail-value">{record.source}</span>
                  </div>
                </div>
                
                <button
                  className="view-images-button"
                  onClick={() => fetchRecordDetails(record.jobId)}
                >
                  View Images
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="images-section">
          <h3>Images for Selected Record</h3>
          
          {selectedRecord.images.wholeSlideImage && (
            <div className="image-category">
              <h4>Whole Slide Image</h4>
              <div className="image-grid">
                <div className="image-item">
                  <img
                    src={selectedRecord.images.wholeSlideImage}
                    alt="Whole slide image"
                    onClick={() => openImageModal(selectedRecord.images.wholeSlideImage, 'whole-slide')}
                    className="image-thumbnail"
                  />
                  <p>Whole Slide Image</p>
                </div>
              </div>
            </div>
          )}

          {Object.keys(selectedRecord.images.cellavisionImages).length > 0 && (
            <div className="image-category">
              <h4>Cellavision Images</h4>
              {Object.entries(selectedRecord.images.cellavisionImages).map(([cellType, images]) => (
                <div key={cellType} className="cell-type-section">
                  <h5>{cellType}</h5>
                  <div className="image-grid">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="image-item">
                        <img
                          src={imageUrl}
                          alt={`${cellType} cellavision image ${index + 1}`}
                          onClick={() => openImageModal(imageUrl, 'cellavision', cellType)}
                          className="image-thumbnail"
                        />
                        <p>{cellType} - Image {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showImageModal && selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeImageModal}>
              ×
            </button>
            <img
              src={selectedImage.url}
              alt={`${selectedImage.type} image`}
              className="modal-image"
            />
            <div className="modal-info">
              <h4>
                {selectedImage.cellType 
                  ? `${selectedImage.cellType} - ${selectedImage.type}`
                  : selectedImage.type
                }
              </h4>
            </div>
          </div>
        </div>
      )}

      <div className="back-to-list">
        <Link to="/species" className="back-button">
          ← Back to Species List
        </Link>
      </div>
    </div>
  );
};

export default SpeciesDetailPage;
