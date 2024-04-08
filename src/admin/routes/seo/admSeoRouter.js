const {
    addSeoMain,
    addSubCategory,
    addCategory,
    getMainCategories,
    getCategories,
    getSubCategoryProducts,
    getSeoAttractions,
    updateSubCategory,
    getSeoDestination,
    getSeoVisaNatinality,
    updateCategory,
    getSeoTours,
    getStandAlone,
    getBlogList,
    getBlogCategory,
} = require("../../controllers/seo/admSeoController");

const router = require("express").Router();

router.post("/add", addSeoMain);
router.post("/category/add", addCategory);
router.post("/subcategory/add", addSubCategory);
router.patch("/subcategory/update", updateSubCategory);
router.patch("/category/update", updateCategory);

router.get("/main-categories", getMainCategories);
router.get("/categories/:id", getCategories);
router.get("/sub-categories/:id/:categoryId", getCategories);
router.get("/sub-categories/:id/:categoryId/:subCategoryId", getSubCategoryProducts);
router.get("/attraction", getSeoAttractions);
router.get("/destination", getSeoDestination);
router.get("/visa", getSeoVisaNatinality);
router.get("/tours", getSeoTours);
router.get("/stand-alone", getStandAlone);
router.get("/blog-list", getBlogList);
router.get("/blog-category", getBlogCategory);

module.exports = router;
