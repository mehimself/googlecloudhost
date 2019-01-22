function reportError(res, msg, err, status) {
  if (!err) {
    err = ''
  }
  if (status === undefined) {
    status = 500
  }
  if (status === 500) {
    console.warn(msg, err)
  } else {
    console.log(msg, err)
  }
  res.status(status || 500).end()
}

function populateApplicationModelsAndRespond(res, application) {
  models.Apps.populate(
    application,
    {
      // todo: what are these paths for? They smell, since models.models does not exist (models.Models does though)
      path: 'models.models' // require user to ascend the application tree asynchronously
    },
    function (err, application) {
      if (err) {
        reportError(res, 'could not populate app.models', err)
      } else {
        res.send(application)
      }
    })
}

function populateModelAndRespond(res, model) {
  models.Models.populate(
    model,
    {
      path: 'models models.models' // require user to ascend the application tree asynchronously
    },
    function (err, model) {
      if (err) {
        reportError(res, 'could not populate model.models', err)
      } else {
        res.send(model)
      }
    })
}

function getUniqueName(collection, prefix) {
  let number = 1,
    uniqueName = prefix
  do {
    if (debug.uniqueName) {
      console.log('unique name', _.find(collection, {name: uniqueName}), collection, uniqueName)
    }
    if (_.find(collection, {name: uniqueName})) {
      uniqueName = prefix + ' ' + number++
    }
  } while (_.find(collection, {name: uniqueName}))
  return uniqueName
}

function authorizeAssetActions(req, res, asset, next) {
  controller.requireLogin(req, res, function () {
    const isParentOwner = req._parent.owners.indexOf(req.user._id) >= 0
    const isParentAdmin = req._parent.admins.indexOf(req.user._id) >= 0
    const isParentEditor = req._parent.editors.indexOf(req.user._id) >= 0
    const isAssetOwner = asset.owners.indexOf(req.user._id) >= 0
    const isAssetAdmin = asset.admins.indexOf(req.user._id) >= 0
    const isAssetEditor = asset.editors.indexOf(req.user._id) >= 0
    let changes = {}
    let denied
    if (asset.permissions === undefined) {
      console.error('no permissions object', asset)
      throw 'authorizeAssetActions: Error: asset has no permissions object'
    } else if (!req.user.isAdmin) {
      req._userCanOwn =
        isAssetOwner
      req._userCanManage =
        isAssetOwner ||
        (isAssetAdmin && asset.permissions.adminCanManage)
      req._userCanCreate =
        isParentOwner ||
        (isParentAdmin && asset.permissions.adminCanCreate) ||
        (isParentEditor && asset.permissions.editorCanCreate)
      req._userCanDelete =
        isAssetOwner ||
        (isAssetAdmin && asset.permissions.adminCanDelete) ||
        (isAssetEditor && asset.permissions.editorCanDelete)
      req._userCanEdit =
        isAssetOwner ||
        (isAssetAdmin && asset.permissions.adminCanEdit) ||
        (isAssetEditor && asset.permissions.editorCanEdit)
      req._userCanView =
        isAssetOwner ||
        (isAssetAdmin && asset.permissions.adminCanView) ||
        (isAssetEditor && asset.permissions.editorCanView)
    } else {
      req._userCanOwn = true
      req._userCanManage = true
      req._userCanCreate = true
      req._userCanDelete = true
      req._userCanEdit = true
      req._userCanView = true
    }
    if (debug.permissions) {
      console.log('authenticateAppQuery asset', (req.params.parentRef ? 'Model' : 'Application'), asset._id)
      console.log('authenticateAppQuery user', req.user.name || req.user.email || req.user._id)
      console.log('authenticateAppQuery isAdmin', req.user.isAdmin, req.user._id)
      console.log('authenticateAppQuery isAssetOwner', isAssetOwner)
      console.log('authenticateAppQuery isAssetAdmin', isAssetAdmin)
      console.log('authenticateAppQuery isAssetEditor', isAssetEditor)
      console.log('authenticateAppQuery canOwn', !!req._userCanOwn)
      console.log('authenticateAppQuery canManage', !!req._userCanManage)
      console.log('authenticateAppQuery canCreate', !!req._userCanCreate)
      console.log('authenticateAppQuery canDelete', !!req._userCanDelete)
      console.log('authenticateAppQuery canEdit', !!req._userCanEdit)
      console.log('authenticateAppQuery canView', !!req._userCanView)
    }
    denied = req.method === 'POST' && !req._userCanCreate
    denied |= req.method === 'DELETE'
    denied &= !req._userCanDelete
    if (req.method === 'PUT' && req.body.models) {
      changes = detectChangesToModels(asset.models, _.map(req.body.models, '_id'))
      denied = (changes.added && !req._userCanCreate) || (changes.missing && !req._userCanDelete)
    }
    if (denied) {
      res.status(403).end()
    } else {
      next()
    }
  })
}

function sortPathByCardinality(permittedPaths, pathOffset) {
  let paths = {
      locals: [],
      descendants: []
    },
    i,
    path,
    pointIndex,
    secondPointIndex,
    name,
    hasDescendants,
    isNewName
  if (pathOffset === undefined) {
    pathOffset = ''
  }
  for (i = 0; i < permittedPaths.length; i++) {
    path = permittedPaths[i]
    if (pathOffset.length) {
      path = path.substr(pathOffset.length)
    }
    pointIndex = path.indexOf('.')
    if (pointIndex > 0) {
      secondPointIndex = path.substr(pointIndex + 1).indexOf('.')
      hasDescendants = secondPointIndex < 0
      if (hasDescendants) {
        secondPointIndex = path.length
      }
      name = path.substr(pointIndex, secondPointIndex)
      isNewName = paths.descendants.indexOf(name) < 0
      if (isNewName) {
        paths.descendants.push(name)
      }
    }
    isNewName = paths.locals.indexOf(path) < 0
    if (isNewName) {
      paths.locals.push(path)
    }
  }
  return paths
}

function filterCollection(collection, permittedPaths, pathOffset) { // todo: allow permittedAttributes to be an array of paths
  pathOffset = pathOffset || ''
  let paths = sortPathByCardinality(permittedPaths),
    path,
    name,
    isPermittedDescendance,
    isDenied
  for (path in paths.locals) {
    // todo: this is broken. name is not initialized. create function named what this is supposed to do
    if (Object.hasOwnProperty(collection, name)) {
      isPermittedDescendance = paths.descendants.indexOf(path) >= 0
      if (isPermittedDescendance) {
        filterCollection(collection[name], permittedPaths, pathOffset + name + '.')
      } else {
        isDenied = paths.locals.indexOf(pathOffset + name) < 0
        if (isDenied) {
          delete collection[name]
        }
      }
    }
  }
}

function detectChangesToModels(collection, update) {
  let changes = {
      missing: false,
      added: false
    },
    i
  for (i = 0; i < update.length; i++) {
    changes.added = collection.indexOf(update[i]) < 0
    if (changes.added) {
      break
    }
  }
  for (i = 0; i < collection.length; i++) {
    changes.missing = update.indexOf(collection[i]) < 0
    if (changes.missing) {
      break
    }
  }
  return changes
}

const debug = {
  permissions: true,
  uniqueName: false
}
const models = require('./../models/GenericApp')
const _ = require('lodash')
const controller = {
  prefetchApplication: function prefetchApplication(req, res, next) {
    models.Apps.findById(
      req.params.appId,
      function (err, application) {
        if (err) {
          reportError(res, 'error finding application by id', err)
        } else if (!application) {
          reportError(res, 'could not find application by id: ' + req.params.appId, err, 404)
        } else {
          req._application = application
          next()
        }
      }
    )
  },
  prefetchParent: function prefetchParent(req, res, next) {
    models[req.params.parentRef].findById(
      req.params.parentId,
      function (err, parent) {
        if (err) {
          reportError(res, 'error finding parent (ref: ' + req.params.parentRef + ') by id', err)
        } else if (!parent) {
          reportError(res, 'could not find parent (ref: ' + req.params.parentRef + ') by id: ' + req.params.parentId, err, 404)
        } else {
          req._parent = parent
          next()
        }
      }
    )
  },
  prefetchModel: function prefetchModel(req, res, next) {
    models.models.findById(
      req.params.modelId,
      function (err, model) {
        if (err) {
          reportError(res, 'could not find model by id', err)
        } else if (!model) {
          res.status(404).end()
        } else {
          req._model = model
          next()
        }
      }
    )
  },
  // <<<<<<<<<<<<<<<<< permissions middleware >>>>>>>>>>>>>>>>>>
  requireLogin: function requireLogin(req, res, next) {
    if (!req.user) {
      res.status(401).end()
    } else {
      next()
    }
  },
  requireAdmin: function requireAdmin(req, res, next) {
    console.log('require admin')
    if (!req.user) {
      res.status(401).end()
    } else if (!req.user.isAdmin) {
      res.status(403).end()
    } else {
      next()
    }
  },
  authorizeApplicationActions: function authorizeApplicationActions(req, res, next) {
    authorizeAssetActions(req, res, req._application, next)
  },
  maskApplicationAttributes: function maskApplicationAttributes(req, res, next) {
    let permittedAttributes = [],
      owningAttributes = [
        'owners',
        'admins',
        'permissions.adminCanManage',
        'permissions.adminCanCreate',
        'permissions.adminCanDelete',
        'permissions.adminCanEdit',
        'permissions.adminCanView'
      ],
      administrationAttributes = [
        'editors',
        'permissions.editorsCanCreate',
        'permissions.editorsCanDelete',
        'permissions.editorsCanEdit',
        'permissions.editorsCanView'
      ],
      editingAttributes = [
        'appId',
        'host',
        'port'
      ]

    if (req._userCanOwn) {
      permittedAttributes = permittedAttributes.concat(owningAttributes)
    }
    if (req._userCanManage) {
      permittedAttributes = permittedAttributes.concat(administrationAttributes)
    }
    if (req._userCanEdit) {
      permittedAttributes = permittedAttributes.concat(editingAttributes)
    }
    filterCollection(req.body, permittedAttributes)
    next()
  },
  authorizeModelActions: function authorizeApplicationActions(req, res, next) {
    authorizeAssetActions(req, res, req._parent, next)
  },
  maskModelAttributes: function maskModelAttributes(req, res, next) {
    let permittedAttributes = [],
      owningAttributes = [
        'owners',
        'admins',
        'permissions.adminCanManage',
        'permissions.adminCanCreate',
        'permissions.adminCanDelete',
        'permissions.adminCanEdit',
        'permissions.adminCanView'
      ],
      administrationAttributes = [
        'editors',
        'permissions.editorsCanCreate',
        'permissions.editorsCanDelete',
        'permissions.editorsCanEdit',
        'permissions.editorsCanView'
      ],
      editingAttributes = [
        'parentId',
        'parentRef',
        'name',
        'attributes'
      ]

    if (req._userCanOwn) {
      permittedAttributes = permittedAttributes.concat(owningAttributes)
    }
    if (req._userCanManage) {
      permittedAttributes = permittedAttributes.concat(administrationAttributes)
    }
    if (req._userCanEdit) {
      permittedAttributes = permittedAttributes.concat(editingAttributes)
    }
    filterCollection(req.body, permittedAttributes)
    next()
  },
  // <<<<<<<<<<<<<<<<< application middleware >>>>>>>>>>>>>>>>>>
  listApplications: function listApplications(req, res) {
    console.warn('todo: filter applications by viewing permissions')
    models.Apps
      .find()
      .populate('models')
      .exec(function (err, applications) {
        if (err) {
          reportError(res, 'could not list and populate applications', err)
        } else {
          models.Apps.populate(
            applications,
            {
              path: 'models.models' // require user to ascend the application tree asynchronously
            },
            function (err, applications) {
              if (err) {
                reportError(res, 'could not populate nested application models', err)
              } else {
                res.send(applications)
              }
            })
        }
      })
  },
  createApplication: function createApplication(req, res) {
    let application = new models.Apps({
      owners: [req.user._id],
      permissions: {
        adminCanManage: true,
        adminCanView: true,
        adminCanCreate: true,
        adminCanEdit: true,
        adminCanDelete: true,
        editorCanCreate: true,
        editorCanView: true,
        editorCanEdit: true,
        editorCanDelete: true
      }
    })
    application.save(function (err, application) {
      if (err) {
        reportError(res, 'could not create application', err)
      } else {
        res.send(application)
      }
    })
  },
  getApplication: function getApplication(req, res) {
    models.Apps
      .findbyId(req._application._id)
      .populate('models')
      .exec(function (err, application) {
        if (err) {
          reportError(res, 'could not get and populate application', err)
        } else {
          populateApplicationModelsAndRespond(res, application)
        }
      })
  },
  updateApplication: function updateApplication(req, res) {
    _.extend(req._application, req.body)
    req._application.save(function (err, application) {
      if (err) {
        reportError(res, 'could not update application', err)
      } else {
        populateApplicationModelsAndRespond(res, application)
      }
    })
  },
  deleteApplication: function deleteApplication(req, res) {
    req._application.remove(function (err, application) {
      if (err) {
        reportError(res, 'could not delete application', err)
      } else {
        res.send(application)
      }
    })
  },
  // <<<<<<<<<<<<<<<<< model middleware >>>>>>>>>>>>>>>>>>
  listModels: function listModels(req, res) {
    console.warn('todo: filter by viewing permission')
    models[req.params.parentRef]
      .findById({
        _id: req._parent._id
      })
      .populate('models')
      .exec(function (err, parent) {
        let populationPathOrigin = req.params.parentRef === 'apps' ? 'application' : 'models'
        if (err) {
          reportError(res, 'could not populate parent (ref: ' + req.params.parentRef + ') models', err)
        } else {
          models[req.params.parentRef].populate(
            parent,
            {
              path: populationPathOrigin + '.models' // require user to ascend the application tree asynchronously
            },
            function (err, parent) {
              if (err) {
                reportError(res, 'could not populate nested models', err)
              } else {
                res.send(parent)
              }
            })
        }
      })
  },
  createModel: function createModel(req, res) {
    let model = new models.Models({
      parentId: req._parent._id,
      parentRef: req.params.parentRef,
      name: getUniqueName(req._parent.models, 'New Model'),
      owners: [req.user._id],
      permissions: {
        adminCanManage: true,
        adminCanView: true,
        adminCanCreate: true,
        adminCanEdit: true,
        adminCanDelete: true,
        editorCanCreate: true,
        editorCanView: true,
        editorCanEdit: true,
        editorCanDelete: true
      },
      value: []
    })
    model.save(function (err, model) {
      if (err) {
        reportError(res, 'could not create model', err)
      } else {
        req._parent.models.push(model._id)
        req._parent.save(function (err) {
          if (err) {
            reportError(res, 'could not update parent ' + req.params.parentRef + ' after model creation', err)
          } else {
            res.send(model)
          }
        })
      }
    })
  },
  getModel: function getModel(req, res) {
    if (!req._userCanView) {
      req.status(403).end()
    } else {
      models.Models
        .findbyId(req._parent._id)
        .populate('models')
        .exec(function (err, model) {
          if (err) {
            reportError(res, 'could not get and populate model', err)
          } else {
            populateModelAndRespond(res, model)
          }
        })
    }
  },
  updateModel: function updateModel(req, res) {
    _.extend(req._model, req.body)
    req._model.save(function (err, model) {
      if (err) {
        reportError(res, 'could not update model', err)
      } else {
        req._parent.models.push(model)
        req._parent.save(function (err) {
          if (err) {
            reportError(res, 'could not update parent after model creation', err)
          } else {
            populateModelAndRespond(res, model)
          }
        })
      }
    })
  },
  deleteModel: function deleteModel(req, res) {
    req._model.remove(function (err, model) {
      if (err) {
        reportError(res, 'could not delete model', err)
      } else {
        for (let i = 0; i < req._parent.models.length; i++) {
          if (req._parent.models[i]._id === model._id) {
            delete req._parent.models[i]
            break
          }
        }
        req._parent.save(function (err) {
          if (err) {
            reportError(res, 'could not update parent ' + req.params.parentRef + ' after deleting child model', err)
          } else {
            res.send(model)
          }
        })
      }
    })
  }
}
module.exports = controller
