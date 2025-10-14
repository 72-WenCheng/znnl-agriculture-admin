import { constantRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes)
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes;
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = constantRoutes.concat(routes)
    },
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          // 在后端菜单树中，将“线上商城、参观预约”作为与“产品溯源”同级的菜单，插入在其后
          try {
            injectMallBookingAsSiblings(res.data)
          } catch (e) { /* 忽略注入失败，保持原状 */ }

          //找到第一个不是外链的数据
          let lastRoute =  filterLastRouter(res.data);
          res.data.unshift({
            component:'Layout',
            hidden:true,
            path:'/',
            redirect:lastRoute.path,
            children:[{name:'Index',path:lastRoute.path,hidden:true,component:lastRoute.component,
            meta:{
                title: lastRoute.meta.title, icon: 'dashboard', noCache: true, link: null,affix:true
            }}]
          });

          const sdata = JSON.parse(JSON.stringify(res.data))
          const rdata = JSON.parse(JSON.stringify(res.data))
          const sidebarRoutes = filterAsyncRouter(sdata)
          const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })
          commit('SET_ROUTES', rewriteRoutes)
          commit('SET_SIDEBAR_ROUTERS', sidebarRoutes)
          commit('SET_DEFAULT_ROUTES', sidebarRoutes)
          commit('SET_TOPBAR_ROUTES', sidebarRoutes)
          resolve(rewriteRoutes)
        })
      })
    }
  }
}
// 递归查找“产品溯源”所在层级，并在其后插入两个同级菜单
function injectMallBookingAsSiblings(list) {
  if (!Array.isArray(list)) return false
  for (let i = 0; i < list.length; i++) {
    const r = list[i]
    if (r.meta && r.meta.title && r.meta.title.indexOf('产品溯源') !== -1) {
      const mallNode = {
        path: '/mall',
        component: 'Layout',
        meta: { title: '线上商城', icon: 'shop-fill' },
        children: [
          { path: 'index', name: 'MallIndex', component: 'mall/index', meta: { title: '线上商城', icon: 'shop-fill', noCache: true } }
        ]
      }
      const bookingNode = {
        path: '/booking',
        component: 'Layout',
        meta: { title: '参观预约', icon: 'online' },
        children: [
          { path: 'index', name: 'BookingIndex', component: 'booking/index', meta: { title: '参观预约', icon: 'online', noCache: true } }
        ]
      }
      // 插入在“产品溯源”之后
      list.splice(i + 1, 0, mallNode, bookingNode)
      return true
    }
    if (r.children && r.children.length) {
      const ok = injectMallBookingAsSiblings(r.children)
      if (ok) return true
    }
  }
  return false
}
//递归找寻叶子节点
function filterLastRouter(route,fullPath=''){
    let firstRoute = route[0]
    let path = fullPath + (firstRoute.path=='/'?'':firstRoute.path)
    if (!firstRoute?.children) {
        let r = JSON.parse(JSON.stringify(firstRoute));
        r.path = path;
        return r;
    }else{
        return filterLastRouter(firstRoute.children,path+'/');
    }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => {
  if (process.env.NODE_ENV === 'development') {
    return (resolve) => require([`@/views/${view}`], resolve)
  } else {
    // 使用 import 实现生产环境的路由懒加载
    return () => import(`@/views/${view}`)
  }
}

export default permission
