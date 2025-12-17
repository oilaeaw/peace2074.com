import type { MediaFile, RefreshToken, Tweet } from '@prisma/client'
import type { JWTPayload } from 'jose'
import type { ObjectId } from 'mongoose'
import type { RouteLocationNormalized, NavigationGuard } from 'vue-router'

export interface AuthPayload extends JWTPayload {
  email?: string
}

export interface User {
  _id: ObjectId
  email: string
  password: string
}
export enum NoteAcionsE {
  Show = 'show',
  Hide = 'hide',
  success = 'success',
  Info = 'info',
  warning = 'warning',
  Errror = 'error',
  Loading = 'loading',
}
export interface Post {
  _id: ObjectId
  user: User
  name: string
  slug: string
  description?: string
  color?: string
  body: string
  hit: number
  createdAt: string
  updatedAt: string
}

export type SortingFunction<T> = (a: T, b: T) => number

export type KeyT = number
export type ColorT = string
export type NameT = string
export type YearT = string
export type TextT = string
export type ValueT = string
export type DescriptionT = string

export interface WindowI {
  Etherium: any
  web3: any
}

export interface RoleI {
  name: NameT
  subject: NameT
  actions: NameT[]
  inverted?: boolean
  conditions?: NameT[]
  fields?: NameT[]
  reason?: NameT
}

export enum LightModesE {
  Dark = 'dark',
  Light = 'light',
  System = 'auto',
}

export enum NoteActionsE {
  Show = 'show',
  Hide = 'hide',
  Success = 'positive',
  Info = 'info',
  Warning = 'warning',
  Errror = 'negative',
  Loading = 'loading',
}

export interface LoadingDefaultsT {
  spinner: string
  message: string
}

export enum PositionsE {
  top = 'top',
  topRight = 'top-right',
  topLeft = 'top-left',
  bottom = 'bottom',
  bottomRight = 'bottom-right',
  bottomLeft = 'bottom-left',
  right = 'right',
  left = 'left',
  center = 'center',
}

export interface HistoryI {
  key: KeyT
  color: ColorT
  name: NameT
  link: LinkT
  year: YearT
  text: string
}

export interface IProject {
  key: string
  value: ValueT
  selected: boolean
}

export interface SponsorI {
  name: string
  img: string
  url: string
}

export interface WorkOptionsI {
  name?: 'SHA-256' | 'PBKDF2'
  encode?: 'base64' | 'utf8' | 'hex'
  salt?: any
  hash?: string
  length?: number
}

export enum NetworksNamesE {
  google = 'google',
  facebook = 'facebook',
  twitter = 'twitter',
  local = 'local',
  passport = 'passport',
}

export enum ScopesNamesE {
  profile = 'profile',
  social = 'social',
  email = 'email',
  fullname = 'fullname',
}

export interface ScopeI {
  name?: string
  network: Partial<NetworksNamesE>
  scope: Partial<ScopesNamesE>
  icon?: string
  emitName?: string | Function
}

export type ScopeT = ScopeI

export interface aya_interface {
  chapter: number
  verse: number
  text: string
}

export interface HarfI {
  value: string
  name?: string
  weight?: number
  description?: string
  color?: string
  encoding?: string
}

export interface KalimatI extends HarfI, aya_interface {
  horuf: HarfI[]
}

export interface AyaI extends KalimatI, HarfI, aya_interface {
  Kalemat: KalimatI[]
}

export interface SuraI {
  id: number
  name: string
  e_name: string
  type: string
  total: number
  ayat: AyaI[]
}

export interface QuranI {
  Surah: SuraI[]
}

export interface QDBI {
  [key: string]: any
  id: number
  name: string
  e_name?: string
  type: string
  total_verses: number
  ayat: aya_interface[]
}

export interface StateI {
  quran: QuranI
  Surah: SuraI[]
  Index: QuranI
}

export interface Q2bI {
  state: StateI
}

export interface LinkT {
  text: string
  icon: string
}

export interface ProjectsI {
  key: string
  value: ValueT
  selected: boolean
}

export type ProjectsT = ProjectsI

export interface SponsorsI {
  name: string
  img: string
  url: string
}

export type SponsorsT = SponsorsI

export interface TransactionInterfaceI {
  addressFrom: string
  addressTo: string
  amount: number
  message: string
  keyword: string
  timestamp: string
  url?: string
  gifUrl?: string
  receiver: string
  sender: string
}

export type TransactionT = TransactionInterfaceI & {
  id?: string | number
}

export type TransactionsT = TransactionT[]

export interface UserI {
  [x: string]: any
  id?: string | ObjectId
  email: string
  username: string
  handle?: string
  password: string
  first_name?: string
  last_name?: string
  profileImage?: string
  role: string
  refreshToken?: RefreshToken[]
  auth0Id?: string
  tweet?: Tweet[]
  mediaFiles?: MediaFile[]
  verified: boolean
  verificationToken?: string
  verificationTokenExpires?: Date
}

export type UserT = UserI

export interface PermessionI {
  id?: string
  action: string | string[]
  subject: string | string[]
  fields?: string | string[]
  conditions?: string[]
  inverted?: boolean
  reason?: string
  permissionId: string
  createdAt?: string
  updatedAt?: string
}

export type PermessionT = PermessionI

export interface TokenI {
  userId: string
  iat: number
  exp: number
}

export interface TokenT {
  id: string
  token: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface RegisterUserT {
  username: string
  user_email: string
  password: string
  repeatPassword: string
  first_name: string
  last_name: string
}

export interface UserSubscriptionI {
  id: string
  endpoint: string
  expirationTime: string
  keys_p256dh: string
  keys_auth: string
  createdAt: string
  updatedAt: string
  userId: string
  user: UserI
}

export interface RefreshTokenT {
  id: string
  token: string
  userId: string
  updatedAt?: Date
  createdAt?: Date
}

export interface PostI {
  [x: string]: string | number
  userId: number | string
  id: number
  title: string
}

export interface RequestPostI {
  data: PostI
}

export interface RouteMiddlewareI {
  (to: RouteLocationNormalized, from: RouteLocationNormalized): ReturnType<NavigationGuard>
}

export enum CaslActionE {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum CaslSubjectE {
  ALL = 'all',
  ADMIN = 'admin',
  CATEGORY = 'category',
  LIKES = 'likes',
  MEDIAFILE = 'mediafile',
  PERMISSIONS = 'permissions',
  POST = 'post',
  ROLES = 'roles',
  REFRESH_TOKEN = 'reshresh_token',
  TWEET = 'tweet',
  USER = 'user',
}

export type CaslActionsT = CaslActionE.CREATE | CaslActionE.READ | CaslActionE.UPDATE | CaslActionE.DELETE

export type CaslSubjectsT = CaslSubjectE.CATEGORY | CaslSubjectE.LIKES | CaslSubjectE.MEDIAFILE | CaslSubjectE.PERMISSIONS | CaslSubjectE.POST | CaslSubjectE.ROLES | CaslSubjectE.TWEET | CaslSubjectE.USER | CaslSubjectE.ADMIN

export interface CaslActionsI {
  actions: CaslActionsT
}

export interface CaslSubjectsI {
  actions: CaslSubjectsT
}

interface KeysT {
  p256dh: string
  auth: string
}

export interface PushSubscriptionI {
  endpoint: string
  expirationTime: string
  keys: KeysT
}

export type SubscriptionT = PushSubscriptionI

export interface BookmarkI {
  _id: string
  userId: string
  bookmark: string
  createdAt: string
  updatedAt: string
}
