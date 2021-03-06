'use strict'

const db = require('APP/db')
const Product = db.model('products')
const ProductItem = db.model('productItems')

const {mustBeLoggedIn, forbidden, assertAdmin} = require('./auth.filters')

module.exports = require('express').Router()
  .param('productId',
    (req, res, next, productId) => {
      if (!Number(productId)) {
        const err = new Error('You tried accessing a product with an ID that is not a number. Product Id must be a number.')
        err.status = 404
        return next(err)
      } else {
        Product.findOne({
          where: {
            id: productId
          },
          include: [{
            model: ProductItem
          }]
        })
        .then(product => {
          if (!product) {
            res.sendStatus(404)
          }
          req.product = product
          next()
        })
        .catch(next)
      }
    })
  .param('categoryId',
    (req, res, next, categoryId) => {
      if (!Number(categoryId)) {
        const err = new Error('You tried accessing a category with an ID that is not a number. Category ID must be a number.')
        err.status = 404
        return next(err)
      } else {
        Product.findAll({
          where: {
            category_id: categoryId
          }
        })
        .then(products => {
          req.productsByCategory = products
          next()
        })
        .catch(next)
      }
    })
  .get('/',
    (req, res, next) =>
      Product.findAll({
        include: [{
          model: ProductItem
        }]
      })
        .then(products => res.json(products))
        .catch(next))
  .post('/', assertAdmin,
    (req, res, next) =>
      Product.create(req.body)
      .then(product => res.status(201).json(product))
      .catch(next))
  .get('/:productId',
    (req, res, next) => {
      res.json(req.product)
    })
  .put('/:productId', assertAdmin,
    (req, res, next) => {
      req.product.update(req.body)
      .then(updatedCategory => {
        res.json(updatedCategory)
      })
      .catch(next)
    })
  .get('/category/:categoryId',
    (req, res, next) => {
      res.json(req.productsByCategory)
    })
