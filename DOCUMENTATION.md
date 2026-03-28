# Blood Smear Image Database — Full Application Documentation

**UC Davis School of Veterinary Medicine**
Developed by Sakshi Singh, M.S. Computer Science, UC Davis
Principal Investigators: Dr. Melanie Audrey Ammersbach & Professor Hugues Beaufrere

---

## What Is the Blood Smear Image Database?

The Blood Smear Image Database is a production-grade scientific web application built at the University of California, Davis. It serves as a comprehensive digital archive of blood smear images taken from exotic, rare, and endangered animals — species that veterinary researchers rarely get the opportunity to study in clinical settings.

A blood smear is a thin layer of blood spread across a glass slide and stained with dyes so that individual blood cells become visible under a microscope. By examining these cells, veterinarians and researchers can identify diseases, parasites, and physiological conditions — a practice called hematology. For exotic and endangered animals, obtaining these specimens is extraordinarily rare. When a zoo, wildlife sanctuary, or conservation team has access to an African elephant, a rare raptor, or a marine mammal, the blood samples collected represent an irreplaceable scientific opportunity.

The Blood Smear Image Database preserves these specimens digitally and makes them accessible to researchers, veterinary students, and clinicians around the world — for free, and at any time.

---

## The Problem This Application Solves

Before this platform existed, blood smear images from exotic animals were scattered across individual researchers' hard drives, printed in journal papers, or simply lost over time. A zoo veterinarian in California might have a rare blood smear from a clouded leopard, but a researcher in Europe studying the same species would never know it existed. There was no central, searchable, publicly accessible repository.

This creates real consequences for veterinary medicine:

- Clinicians treating an exotic animal in an emergency have no reference material to compare normal versus abnormal blood cells for that species.
- Students studying wildlife medicine cannot access teaching material for species they will encounter in practice.
- Researchers trying to establish baseline hematological values for endangered species have no aggregate dataset to work from.

The Blood Smear Image Database directly solves all three problems. It is, to the best of the team's knowledge, the only web-based platform of its kind for exotic animal hematology.

---

## Who Uses This Application?

The platform is designed for three primary audiences:

**Veterinary Researchers** — Scientists studying comparative hematology, wildlife disease, or conservation medicine use the database to access reference specimens, build research datasets, and validate diagnostic criteria across species.

**Veterinary Clinicians** — Practitioners treating exotic animals in zoos, aquariums, wildlife rehabilitation centers, and specialty clinics use the database as a diagnostic reference. When a clinician encounters an unusual blood cell in a bird of prey, they can search the database to find comparable specimens.

**Veterinary Students and Educators** — Students learning hematology need exposure to diverse species. The database provides a curriculum resource that would otherwise require physical access to rare specimens.

**Contributing Institutions** — Zoos, wildlife sanctuaries, research laboratories, and conservation organizations contribute specimens to the database, expanding the archive and benefiting the global community.

---

## Application Pages and Features

### Home Page

The home page serves as the entry point to the database. It presents the mission of the platform with a UC Davis branded design — the university's signature navy blue and gold color palette is used throughout. From the home page, users can navigate to browse and search the database, read about the project and its investigators, or contribute their own specimens.

The design is intentionally clean and research-focused. It communicates the scientific credibility of the platform while remaining accessible to users who are not computer experts.

### Browse and Search Page

The browse and search page is where researchers spend most of their time. It provides a powerful, multi-layered search system built on taxonomic classification — the scientific system biologists use to organize all living things.

Users can search in two ways. The first is a free-text search: type any part of a species name, family, order, or class, and the system returns matching records. The second is a hierarchical filter system: users can drill down from phylum to class to order to family, narrowing results progressively. Additional filters for health status (healthy, sick, deceased) and stain type (the chemical method used to prepare the slide) allow researchers to find exactly the kind of specimens they need.

Results are paginated and returned in reverse chronological order, showing the most recently added specimens first. Each result card displays the common name, scientific name, taxonomic classification, health status, stain type, and the contributing institution.

The search system covers the full taxonomic breadth of the animal kingdom — from Chordata (vertebrates including birds, mammals, and reptiles) to Arthropoda, Mollusca, Annelida, Echinodermata, and beyond. This reflects the reality that hematological research spans the entire tree of life.

### Whole-Slide Image Viewer

The image viewer is perhaps the most technically impressive feature of the platform. Whole-slide images — the kind produced by digital slide scanners used in pathology — are enormous files. A single image of a blood smear at full resolution can be one to four gigabytes in size. These files cannot simply be displayed in a web browser the way a normal photograph can.

The platform solves this using a technology called Deep Zoom Imaging, or DZI. When a whole-slide image is uploaded, the system automatically converts it into a pyramid of small image tiles, each 256 pixels square. Each level of the pyramid represents a different zoom level — from a thumbnail showing the entire slide, all the way up to the full resolution view showing individual blood cells. This is the same technique used by Google Maps to serve satellite imagery at every zoom level.

The viewer is powered by OpenSeadragon, an open-source web viewer built for exactly this kind of gigapixel imagery. As a user pans and zooms, OpenSeadragon requests only the tiles needed for the current viewport — so the browser never has to load the full multi-gigabyte file. The experience is smooth and responsive, even for the largest slides.

This means a researcher in Australia can zoom into an individual red blood cell on a slide from a Komodo dragon held at a California zoo, with the same quality and detail as if they were looking through a microscope in the same room.

### Contribute Page

The contribute page is where new specimens enter the database. It is a carefully structured submission form divided into six numbered sections, each collecting a different category of information.

**Section 1 — Basic Information** collects the common name and scientific name of the animal. The scientific name must follow standard binomial nomenclature — the two-word Latin naming system used universally in biology.

**Section 2 — Taxonomy** captures the full taxonomic classification: phylum, class, order, family, genus, and species. The class options are dynamically populated based on the selected phylum, preventing invalid combinations. For example, selecting Chordata as the phylum will offer Aves (birds), Mammalia (mammals), Reptilia (reptiles), and other valid chordate classes.

**Section 3 — Specimen Details** records the health status, sex, and age of the animal at the time of collection. This is critical scientific context — a blood smear from a healthy elephant looks very different from one taken from a sick animal.

**Section 4 — Collection and Attribution** documents who submitted the specimen, what institution they represent, when and where the blood was collected, what stain was used, and at what magnification the image was captured.

**Section 5 — Additional Details** is an optional section for supplementary clinical measurements: body weight, body condition score, hematocrit (the percentage of blood volume composed of red blood cells), total protein, and free-text notes for any other relevant clinical context.

**Section 6 — Upload** is where the actual image files are submitted. The form supports two upload modes, selected at the top of the page using large card-style buttons.

The first mode is **Full Slide Image** — a single whole-slide image file in TIFF, NDPI, SVS, PNG, or JPEG format. These are large files produced by digital slide scanners. The upload field supports drag-and-drop.

The second mode is **CellaVision Images** — multiple individual cell images organized by cell type. CellaVision is a digital morphology system used in clinical laboratories that automatically identifies and photographs individual blood cells. This mode presents a panel of predefined cell types (Heterophil, Eosinophil, Basophil, Lymphocyte, Monocyte) and allows contributors to add custom cell types. Images can be added to each cell type category individually.

After submission, the form displays a job confirmation with a unique Job ID that contributors can use to track the processing status of their upload.

At the bottom of the contribute page, an alternative submission method is offered for contributors who cannot digitize their specimens. They can mail physical glass slides directly to the UC Davis laboratory, with a postal address and contact email provided.

### About Page

The about page provides full context on the people and mission behind the database. It features biographical profiles of the two principal investigators — Dr. Melanie Audrey Ammersbach and Professor Hugues Beaufrere — along with their research specialties and institutional affiliations. A statistics banner highlights the scale of the database: over 500 species represented, more than 10,000 blood smear images, and contributions from over 100 institutions worldwide.

The about page also profiles the developer, Sakshi Singh, a first-year Master's student in Computer Science at UC Davis who designed and built the entire platform. A technology section explains the imaging protocols and quality standards applied to every specimen in the archive.

---

## How the Technical System Works

### The Upload Pipeline

When a contributor submits a specimen, the process begins at the React frontend — the web interface running in the user's browser. The form data and image files are sent over the internet to the Node.js backend server, which is built with the Express framework.

The first thing the backend does with an uploaded file is scan it for viruses using ClamAV, an open-source antivirus engine. Because the database accepts file uploads from external contributors around the world, this security step is non-negotiable. The file is temporarily downloaded from cloud storage, scanned, and the temporary copy is immediately deleted.

Simultaneously, the file is streamed directly to Amazon Web Services S3 — cloud object storage — into a bucket designated for raw uploads. For large files (over 100 megabytes), the system uses S3's multipart upload capability, splitting the file into 10-megabyte chunks and uploading four chunks in parallel. This prevents timeouts and allows reliable transfer of multi-gigabyte slide files.

Once the file is safely in cloud storage, the backend saves the specimen metadata to MongoDB — a document database — and assigns the job a status of "streamed to S3." Then it sends a message to Apache Kafka, a high-performance message streaming system, and immediately returns a response to the user's browser with a Job ID. From the user's perspective, the submission is complete in seconds.

### Asynchronous Processing with Apache Kafka

The real work of processing the image happens asynchronously — meaning it runs in the background, completely separate from the web server, while the user gets on with their day.

Apache Kafka acts as a message queue. Think of it as a relay baton: the web server hands off a message describing the job (job ID, file location, upload type), and a separate background process called the Kafka Consumer picks it up and does the heavy processing.

This architectural choice is significant. Without Kafka, the web server would have to convert gigabyte-sized slide images synchronously — holding up the entire server for minutes at a time and making the application unusable for other users. With Kafka, the web server remains fast and responsive, and image processing happens in a dedicated pipeline that can scale independently.

### Deep Zoom Image Generation

For whole-slide images, the Kafka Consumer executes a multi-step pipeline.

First, it streams the raw TIFF or SVS file from S3 to a local temporary folder on the server. Large files are downloaded chunk by chunk — the server never loads the entire gigabyte file into memory at once.

Next, it checks whether the image is a multi-scene file. Some whole-slide scanners produce files with multiple embedded images — a low-resolution overview, a high-resolution full scan, and various calibration images. The system uses image metadata to detect how many scenes are present.

Then it runs the DZI conversion using Sharp, a high-performance Node.js image processing library. Sharp reads the full-resolution image and generates a complete pyramid of JPEG tiles at 256 pixels square. Each zoom level is a separate directory of tiles — the lowest zoom level might have a single tile showing the whole slide, while the highest zoom level might have thousands of tiles representing individual cell-level detail.

The resulting tiles are uploaded to S3 in batches of 50, running each batch in parallel for maximum throughput. The system logs progress — tile count, percentage complete, upload rate per second, and elapsed time — so the processing pipeline is fully observable.

Once all tiles are uploaded, the system also uploads the DZI manifest file — an XML descriptor that tells the OpenSeadragon viewer exactly how many zoom levels exist, where the tiles are, and how they fit together.

Finally, all temporary files are deleted from local storage, the MongoDB record is updated with the DZI URL and processing statistics (pyramid levels, total tile count), and the job status is set to complete.

The resulting CloudFront URL — pointing to Amazon's global content delivery network — is what the viewer uses to load tiles. CloudFront caches tiles at edge locations around the world, so a researcher in Europe loading a slide stored in a US data center gets tiles delivered from a nearby European server, not across the Atlantic.

### The Database and Search System

All specimen metadata is stored in MongoDB. Each record contains the full taxonomic classification, specimen details, upload information, processing status, and the URLs needed to access the images.

The search and browse system constructs MongoDB queries dynamically based on whatever filters the user has applied. A search for "raptor" will match against common name, scientific name, phylum, class, order, and family fields simultaneously. A taxonomic filter for class "Aves" will return all bird specimens. A combined filter for class Aves plus health status "healthy" will return only healthy bird specimens. Pagination is applied at the database level, so the server never has to load an entire result set into memory.

Only records with an approved status and a "ready for viewer" processing status are returned in public browse queries. This two-stage gate — administrator approval plus completed processing — ensures that only high-quality, fully processed specimens appear in the public archive.

---

## The Technology Choices and Why They Matter

**React** for the frontend means the user interface is fast, component-based, and maintainable. Pages like the browse view and the whole-slide viewer update dynamically without full page reloads, giving the application a smooth, app-like feel.

**Node.js and Express** for the backend means the API server runs JavaScript — the same language as the frontend — which simplifies the development stack. Express is the most widely used web framework in the Node.js ecosystem, with extensive library support.

**MongoDB** was chosen because specimen records are naturally document-shaped. A blood smear record has nested taxonomy data, arrays of cell images, and varying optional fields — all of which fit naturally into MongoDB's flexible document model without the rigidity of a relational database schema.

**Apache Kafka** provides the processing decoupling described above. In a research data system where uploads can be gigabytes and processing can take minutes, this architectural separation is essential. Kafka also provides durability — if the processing server crashes mid-job, the message is not lost and can be reprocessed.

**Sharp** is one of the fastest image processing libraries available for Node.js, built on top of the libvips image processing library. It handles multi-gigabyte TIFF files efficiently without exhausting server memory, which is critical for whole-slide images.

**OpenSeadragon** is the industry-standard open-source viewer for whole-slide images and DZI-format data. It is used by major digital pathology platforms and research institutions worldwide. Its viewport-only tile loading strategy makes multi-gigabyte image viewing feasible in any web browser.

**AWS S3** provides virtually unlimited, durable, highly available object storage. Two separate buckets are used: a raw bucket for original uploads and generated DZI tiles, and a processed bucket for CellaVision outputs. This separation ensures raw data is never overwritten or confused with processed outputs.

**AWS CloudFront** sits in front of the S3 tile storage as a content delivery network. When OpenSeadragon requests a tile, CloudFront serves it from the nearest edge location — one of hundreds of AWS data centers globally — rather than from the origin S3 bucket. This dramatically reduces latency for international users.

**ClamAV** is an open-source antivirus engine widely used in institutional environments. It integrates with the upload pipeline through a Node.js wrapper and provides a reliable security layer without requiring a paid third-party service.

---

## Data Model: What Information Is Stored for Each Specimen

Each specimen record in the database contains:

- **Identity** — Common name and scientific name
- **Taxonomy** — Phylum, class, order, family, genus, and species
- **Specimen context** — Sex, age, health status
- **Collection details** — Date collected, geographic location
- **Imaging parameters** — Stain type, magnification, scanner or imaging system used
- **Attribution** — Contributor name, institution
- **Clinical measurements** (optional) — Body weight, body condition score, hematocrit, total protein
- **Free-text notes** — Any additional clinical observations
- **Processing status** — A state machine tracking the job from submission through processing to public availability
- **Image references** — S3 keys and CloudFront URLs for the whole-slide DZI or CellaVision images
- **Approval status** — Whether the record has been reviewed and approved for public access

This metadata schema was designed to support both immediate clinical utility (quick lookup of health status and stain type) and long-term research utility (full taxonomic classification enabling cross-species comparative studies).

---

## Security and Data Integrity

Every file uploaded to the platform is virus-scanned by ClamAV before it enters the processing pipeline. The scan runs against the file stored in S3 — the file is temporarily downloaded, scanned, and the local copy immediately deleted, regardless of the scan result.

File type validation is enforced at the API level. Only TIFF, SVS, PNG, JPEG, and NDPI files are accepted as whole-slide images. Only standard image types are accepted as CellaVision cell images.

S3 buckets are configured with private ACLs — files are not publicly accessible via direct S3 URLs. Access to images is mediated through CloudFront with signed URL policies, ensuring content is only served through the application's legitimate access paths.

Specimen records require explicit administrator approval before they appear in public search results. This review step ensures taxonomic accuracy, image quality, and metadata completeness before a specimen joins the archive.

---

## The Development Story

The Blood Smear Image Database was conceived and built by Sakshi Singh, a first-year Master's student in Computer Science at UC Davis, working directly with the veterinary research team led by Dr. Melanie Audrey Ammersbach and Professor Hugues Beaufrere.

The platform was built from the ground up — no existing platform was repurposed or adapted. Every architectural decision, from the choice of Kafka for asynchronous processing to the DZI tile pipeline for whole-slide viewing, was made to meet the specific demands of a scientific research data repository serving a global audience with multi-gigabyte medical imaging files.

The frontend design system uses the official UC Davis color palette — navy blue (#022851) and gold (#FFBF00) — and was crafted to project the scientific credibility of the institution while remaining intuitive for users who are researchers first and technology users second.

The system is fully deployed on AWS infrastructure, with the React frontend hosted on S3, the Node.js backend running on an EC2 instance, and all image data stored and served through S3 and CloudFront.

---

## Research Impact and Significance

The Blood Smear Image Database represents a meaningful contribution to veterinary medicine and comparative biology in several ways.

**Preservation of irreplaceable data.** Blood samples from rare and endangered animals are collected under exceptional circumstances — often during routine health checks at zoos, during rescue operations, or post-mortem. These opportunities may not occur again for a given species for years. Digitizing and archiving these specimens ensures the data outlasts the physical slide.

**Enabling comparative hematology.** By aggregating specimens across hundreds of species, the database enables researchers to study how blood cell morphology differs across the animal kingdom — questions that are simply impossible to study without a large, diverse, accessible dataset.

**Supporting conservation medicine.** Wildlife veterinarians working in the field need reference material. When treating a sick animal of a species rarely seen in clinical practice, access to normal blood cell images for that species can be the difference between an accurate diagnosis and a missed one.

**Training the next generation.** Veterinary students training in exotic animal medicine need exposure to diverse species. The database provides a teaching resource that supplements textbooks and clinical rotations with real, high-resolution specimens from actual cases.

**Accelerating research.** Rather than spending months sourcing specimens from disparate institutions and negotiating data-sharing agreements, researchers can access a curated, metadata-rich dataset immediately. This lowers the barrier to entry for hematological research in non-traditional species.

---

## Summary

The Blood Smear Image Database is a full-stack web application that combines a React-based research interface with a cloud-native backend capable of handling multi-gigabyte medical images. It makes rare and scientifically irreplaceable blood smear specimens from exotic animals accessible to researchers, clinicians, and students worldwide.

The platform's most distinctive technical achievement is its whole-slide image pipeline: a fully automated workflow that accepts a multi-gigabyte TIFF or SVS file, converts it to a Deep Zoom Image pyramid of thousands of JPEG tiles, uploads those tiles to AWS S3, and serves them globally via CloudFront — making it possible to zoom from a thumbnail view to individual blood cell detail inside any web browser, anywhere in the world.

Built by a single graduate student at UC Davis, in close collaboration with world-class veterinary pathologists, the platform demonstrates what is possible at the intersection of modern web technology and scientific research infrastructure.

---

*UC Davis School of Veterinary Medicine — Blood Smear Image Database*
*One Shields Avenue, Davis, CA 95616*
*Contact: mammersbach@ucdavis.edu*
