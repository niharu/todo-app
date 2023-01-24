import React, { useRef, useEffect, useState } from "react";

import {
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { TodoTitle } from "./TodoTitle";
import { TodoAdd } from "./TodoAdd";
import { TodoList } from "./TodoList";
import { useTodo } from "../hooks/useTodo";

import * as menusData from "../apis/menus";
import { Menu } from "../model/Menu";

function App() {
  const {
    todoList,
    addTodoListItem,
    toggleTodoListItemStatus,
    deleteTodoListItem,
  } = useTodo();

  const [menuList, setMenuList] = useState<Menu[]>([]);

  useEffect(() => {
    menusData.getAllMenus().then((menus: Menu[]) => {
      setMenuList(menus);
      console.log("API GET menus: 1", menus[0].isDiscounted);
      console.log("API GET menus: 2", menus[1].isDiscounted);
      console.log("API GET menus: 3", menus[2].isDiscounted);
      console.log("API GET menus: 4", menus[3].isDiscounted);
    });
  }, []);

  const [gachaList, setGachaList] = useState<Menu[]>([]);

  const [totalPrice, setTotalPrice] = useState<number>();

  const handleTurnGacha = () => {
    // console.log("menuList ボタン押下直後:", menuList);
    let total: number = 0;

    const minPrice: number = Math.min(
      ...menuList.map((menu: Menu) => menu.price)
    );

    var gachaList: Menu[] = [];

    // console.log("menuList isDicounted設定前:", menuList);
    menuList.forEach((menu) => (menu.isDiscounted = false));
    // console.log("menuList isDicounted設定後:", menuList);

    do {
      console.log("=================================================");
      console.log("=================================================");

      // メニューリストから、残りの金額で買えるものだけに絞る
      const filteredMenuList = [...menuList].filter(
        (menu: Menu) => menu.price <= 1000 - total
      );
      // console.log("filteredMenuList:", filteredMenuList);
      console.log("filteredMenuList");
      filteredMenuList.forEach((gacha) =>
        console.log(
          "id:",
          gacha.id,
          "name:",
          gacha.name,
          "isDiscounted:",
          gacha.isDiscounted
        )
      );

      // 残りの金額で買えるものがなくなったら終了
      if (filteredMenuList.length === 0) break;

      const listLength = filteredMenuList.length;
      const randomNum = Math.floor(Math.random() * listLength);

      const gachaMenu = filteredMenuList[randomNum];
      const price = gachaMenu.price;

      // console.log("ガチャの結果：", gachaMenu);

      // 値引きが設定されていて、かつまだ値引きをしていないメニューを取得
      const discountFoodMenu = [...gachaList, gachaMenu].filter(
        (menu: Menu) => !menu.isDiscounted && menu.drinkDiscount > 0
      )[0];

      // まだ値引きをしていないドリンクを取得
      const discountDrinkMenu = [...gachaList, gachaMenu].filter(
        (menu: Menu) =>
          !menu.isDiscounted &&
          (menu.category === "hotdrink" || menu.category === "icedrink")
      )[0];

      // console.log("discountFoodMenu:", discountFoodMenu);
      // console.log("discountDrinkMenu:", discountDrinkMenu);

      // 値引き可能なセットが揃っている場合、値引きを行う
      if (discountDrinkMenu && discountFoodMenu) {
        // console.log(discountFoodMenu.drinkDiscount, "円の値引きをしました！");
        total -= discountFoodMenu.drinkDiscount;
      }

      // 1000を超える場合は終了
      if (total + price > 1000) break;

      total += price;
      gachaList.push({ ...gachaMenu });

      // 値引き可能なセットが揃っている場合、値引きを行ったことを設定する
      // （gachaMenuがリストに追加されてから設定する方が実装上楽なのでこのタイミングで実施）
      if (discountDrinkMenu && discountFoodMenu) {
        console.log("isDicounted設定前");
        gachaList.forEach((gacha) =>
          console.log(
            "id:",
            gacha.id,
            "name:",
            gacha.name,
            "isDiscounted:",
            gacha.isDiscounted
          )
        );

        gachaList.filter(
          (menu: Menu) => menu.id === discountDrinkMenu.id
        )[0].isDiscounted = true;

        const targetDrinkIndex = gachaList.indexOf(discountDrinkMenu);
        gachaList.splice(targetDrinkIndex, 1);
        gachaList.unshift(discountDrinkMenu);

        gachaList.filter(
          (menu: Menu) => menu.id === discountFoodMenu.id
        )[0].isDiscounted = true;

        const targetFoodIndex = gachaList.indexOf(discountFoodMenu);
        gachaList.splice(targetFoodIndex, 1);
        gachaList.unshift(discountFoodMenu);

        console.log("isDicounted設定後");
        gachaList.forEach((gacha) =>
          console.log(
            "id:",
            gacha.id,
            "name:",
            gacha.name,
            "isDiscounted:",
            gacha.isDiscounted
          )
        );
      }
    } while (total < 1000);

    setGachaList(gachaList);
    setTotalPrice(total);
  };

  const inputEl = useRef<HTMLTextAreaElement>(null);

  const handleAddTodoListItem = () => {
    const inputValue = inputEl.current?.value;
    if (!inputValue) return;

    addTodoListItem(inputValue);
    inputEl.current.value = "";
  };

  const inCompletedList = todoList.filter((todo) => {
    return !todo.done;
  });

  const completedList = todoList.filter((todo) => {
    return todo.done;
  });

  return (
    <Container centerContent p={{ base: "4", md: "6" }} maxWidth="3xl">
      {/* <TodoTitle title="TODO進捗管理" fontSize="2xl" mt="0" />

      <TodoAdd
        placeholder="ADD TODO"
        leftIcon={<AddIcon />}
        buttonText="TODOを追加"
        inputEl={inputEl}
        handleAddTodoListItem={handleAddTodoListItem}
      />

      <TodoList
        todoList={inCompletedList}
        toggleTodoListItemStatus={toggleTodoListItemStatus}
        deleteTodoListItem={deleteTodoListItem}
        title="未完了TODOリスト"
        fontSize="xl"
      />

      <TodoList
        todoList={completedList}
        toggleTodoListItemStatus={toggleTodoListItemStatus}
        deleteTodoListItem={deleteTodoListItem}
        title="完了TODOリスト"
        fontSize="xl"
      /> */}

      <>
        <Button onClick={handleTurnGacha}>ガチャを回す</Button>
        <Text>合計金額：{totalPrice}</Text>
        <List w="full">
          {gachaList.map((menu: Menu) => (
            <>
              <ListItem
                borderWidth="1px"
                p="4"
                mt="4"
                bg="white"
                borderRadius="md"
                borderColor="gray.300"
                backgroundColor="#fbd24d"
              >
                <Text color="#3d2900">
                  {menu.name} size:{menu.size}
                </Text>
                <Text>{menu.price}</Text>
              </ListItem>
            </>
          ))}
        </List>
      </>
    </Container>
  );
}

export default App;
