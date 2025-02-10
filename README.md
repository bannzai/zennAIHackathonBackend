
# モバイルアプリのリポジトリ
https://github.com/bannzai/zenn_ai_hackathon

## Setup
1. Firebaseプロジェクトを一つ作ってください
2. 次に `.firebaserc` を作成します。このリポジトリでは .gitignoreしています

```
{
  "projects": {
    "default": "PROJECT_NAME" ← ここにプロジェクトネーム入れる
  }
}
```

## Env
See [.env.sample](./functions/.env.sample)

```
# localhostで起動する場合は local を設定。あとはdev,prodどちらでも良い
APP_ENV=dev
# 多分ここから取得。https://aistudio.google.com/app/apikey?hl=ja
GOOGLE_GENAI_API_KEY=
# この命名のサービスアカウントがいるのでそれを使います。何必要かは忘れました(Cloud TasksのURLを取得だったかな)
GOOGLE_APPLICATION_CREDENTIALS_SERVICE_ACCOUNT_ID=PROJECT_ID@appspot.gserviceaccount.com
```

## Dev
`Env` を用意します。ただ、localhostで動作確認する場合は APP_ENV=local に設定してください。authが無効になるのでdeploy時は気をつけてください
`functions` ディレクトリに移動して `npm run genkit:start` をします

`
$ cd functions
$ npm run genkit:start
`

http://localhost:4000/ からgenkitのWeb UIから動作確認できます

## Deploy

functionsディレクトリに移動します。firebase deployをすればdeployされますが、./lib とかも消したい場合は以下のようにしています

```
$ cd functions
$ rm -rf ./lib && npm run build && firebase deploy --only functions
```

また、IAMの権限の問題で何かが必要なことがあったかもしれません。なんの権限か忘れましたが、エラーメッセージに表示されると思います。必要があれば連絡ください
