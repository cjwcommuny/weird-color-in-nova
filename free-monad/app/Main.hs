module Main where

main :: IO ()
main = putStrLn "Hello, Haskell!"

data Free f a = Pure a | Free (f (Free f a)) deriving (Functor)

instance Functor f => Applicative (Free f) where
    pure = Pure
    Pure f <*> Pure a = Pure (f a)
    Pure f <*> Free ma = Free (fmap (fmap f) ma)
    Free f <*> b = Free ((<*> b) <$> f)

instance Functor f => Monad (Free f) where
    return = pure
    Pure a >>= f = f a
    Free m >>= f = Free ((>>= f) <$> m)

wrap :: f (Free f a) -> Free f a
wrap = Free

liftF :: Functor f => f a -> Free f a
liftF f = wrap $ fmap Pure f

data ZIOF next where
    PutStrLn :: String -> (() -> next) -> ZIOF next
    GetStrLn :: (String -> next) -> ZIOF next

deriving instance Functor ZIOF

interpretZIOF :: ZIORuntime -> ZIOF a -> IO a
interpretZIOF _ (PutStrLn line next) = next <$> putStrLn line
interpretZIOF _ (GetStrLn next) = next <$> getLine

runConsole :: ZIORuntime -> ZIO a -> IO a
runConsole rt (Pure val) = pure val
runConsole rt (Free act) = do
    next <- interpretZIOF rt act
    runConsole rt next

type ZIO = Free ZIOF

putStrLn' :: String -> ZIO ()
putStrLn' line = liftF $ PutStrLn line id

getStrLn' :: ZIO String
getStrLn' = liftF $ GetStrLn id

myApp :: ZIO ()
myApp = _

data ZIORuntime

runZIO :: ZIORuntime -> ZIO a -> IO a
runZIO = _

withZIORuntime :: (ZIORuntime -> IO a) -> IO a
withZIORuntime = _
