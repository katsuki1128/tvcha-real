import React, { useState, useEffect } from 'react';

import "firebase/firestore";
import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  getDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  onSnapshot,
  increment
} from "firebase/firestore";

import { getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBs-rcINsUSZe7bD7OeLTrNcXm6-OInABg",
  authDomain: "tvcha-9cae7.firebaseapp.com",
  projectId: "tvcha-9cae7",
  storageBucket: "tvcha-9cae7.appspot.com",
  messagingSenderId: "866848033597",
  appId: "1:866848033597:web:c6887382eb14ee58351354"
};

const collectionName = "alterbooth";
const collectionUsernName = "alter-user";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ストレージにアクセスするための接続情報を取得
const storage = getStorage(app);
// ストレージサービスからストレージ参照を作成する
const storageRef = ref(storage);

//----------------------------------------
// ▼firebaseから読み込んで画面に表示する
//----------------------------------------

// ⭐️stampListという空の配列を作り、今後setStampListメソッドで
// 更新していくことをuseState([])で定義
const App = () => {
  const [stampList, setStampList] = useState([]);
  const [userList, setUserList] = useState([]);

  // ⭐️初回読み込み時のみスタンプリストを読み込む
  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("order", "asc")); // orderの値で降順にソートするクエリを作成

    onSnapshot(q, (querySnapshot) => {
      const newStampList = querySnapshot.docs.map((doc) => {
        const { img, point, count, order } = doc.data();
        return {
          id: doc.id,
          img,
          point,
          count,
          order,
        };
      });
      console.log(newStampList);
      setStampList(newStampList);
    });
  }, []);

  //   // ⭐️初回読み込み時のみユーザー情報を読み込む
  useEffect(() => {
    onSnapshot(collection(db, collectionUsernName), (querySnapshot) => {
      const newUserList = querySnapshot.docs.map((doc) => {
        const { user, point } = doc.data();
        return {
          id: doc.id,
          user,
          point,
        };
      });
      setUserList(newUserList);
      console.log(newUserList);
    });
  }, []);

  // //----------------------------------------
  // // スタンプをスクロールするための準備
  // //----------------------------------------
  // const renderStampItem = ({ item, index }) => (
  //   <TouchableOpacity
  //     key={index} // ここで一意のkeyを設定する
  //     style={styles.stampContainer}
  //     onPress={() => stampClick(item, item.id, userList[0].id)}
  //   >
  //     <Image style={styles.image} source={{ uri: item.img }} />
  //     <Text style={[styles.text, { textAlign: 'center' }]}>
  //       {item.point}
  //     </Text>
  //   </TouchableOpacity>
  // );

  const renderStampItem = ({ item, index }) => (
    <div
      key={index}
      className="stampContainer"
      onClick={() => stampClick(item, item.id, userList[0].id)}
    >
      <img className="image" src={item.img} alt="スタンプ画像" />
      <p style={{ textAlign: 'center' }}>{item.point}</p>
    </div>
  );


  //----------------------------------------
  // ▼画面描画内容
  //----------------------------------------

  return (
    <>
      <div className="centered-container">
        <img src="../public/img/geekersnight.png" className="centered-image" alt="Geekers Night" />
      </div>

      <div className="logoText">
        <p>#スタンプを飛ばして思いをシェア！</p>
        <p>#イベントをどんどん盛り上げよう！</p>
      </div>

      <div className="container">
        {stampList.map((item, index) => (
          renderStampItem({ item, index })
        ))}
      </div>
      <div className="container">
        <h1 style={{ fontSize: 36 }}>👇持ちポイント</h1>
        <div>
          <h2 style={{ fontSize: 48 }}>
            {userList.length > 0 ? userList[0].point : ''}
          </h2>
        </div>
      </div>
    </>

    //   <SafeAreaView style={[styles.container]}>
    //     <Text style={{ fontSize: 36 }}>👇テレビをスマホに配信👇</Text>
    //     <Image
    //       style={styles.imagetv}
    //       source={require('./Sequence04.gif')} />

    // <Text >👇スタンプエリア</Text>
    //     <View style={{ flex: 1 }}>
    //       <FlatList
    //         style={[styles.stampsContainer]}
    //         data={stampList}
    //         renderItem={renderStampItem}
    //         keyExtractor={(index) => index.toString()}
    //         numColumns={4}
    //       />
    //     </View>


    // <Text style={{ fontSize: 36 }}>👇持ちポイント</Text>
    // <View>
    //   <Text style={{ fontSize: 48 }}>
    //     {userList.length > 0 ? userList[0].point : ''}
    //   </Text>
    // </View>

    //     <StatusBar style="auto" />

    //   </SafeAreaView>
  );
};


//----------------------------------------
// ▼スタンプがクリックされた時にfirebase上でのクリック数とポイント数を更新する
//----------------------------------------

const stampClick = async (data, stampId, userId) => {
  console.log(data);

  const clickedCount = data.count //クリックされたスタンプのそれまでのクリック数
  const consumptionPoint = data.point //クリックされたスタンプの消費ポイント

  // Firebaseのクリック数を一つ増やす
  await updateDoc(doc(db, collectionName, stampId), {
    count: clickedCount + 1
  });

  // Firebaseからユーザーの情報を取得
  const clickUser = await getDoc(doc(db, collectionUsernName, userId));
  const userHavePoint = clickUser.data().point;  //ユーザーが持つポイント数

  // ドキュメントのpointを使用して更新
  await updateDoc(doc(db, collectionUsernName, userId), {
    point: userHavePoint - consumptionPoint
  });

  console.log("カウントが正常に更新されました。");

};


//----------------------------------------
// ▼styleを設定する
//----------------------------------------


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     fontSize: 18,
//   },
//   flatListContent: {
//     padding: 10,
//   },
//   imagetv: {
//     width: 480,
//     height: 240,
//   },
//   image: {
//     width: 80,
//     height: 80,
//   },
//   row: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   stampContainer: {
//     // margin: 10,
//     width: '25%', // 1行に4つのスタンプなので、横幅を適切に設定
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   stampsContainer: {
// height: 200,
// },
// });

export default App;

