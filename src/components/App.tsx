import React, { useRef, useEffect, useState } from "react";

import * as lodash from "lodash";

import { ulid } from "ulid";

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

  useEffect(() => {
    menusData.getAllMenus().then((menus: Menu[]) => {
      setMenuList(menus);
      // console.log("API GET menus: 1", menus[0].isDiscounted);
      // console.log("API GET menus: 2", menus[1].isDiscounted);
      // console.log("API GET menus: 3", menus[2].isDiscounted);
      // console.log("API GET menus: 4", menus[3].isDiscounted);
    });
  }, []);

  const [menuList, setMenuList] = useState<Menu[]>([]);

  const [gachaList, setGachaList] = useState<Menu[]>([]);

  const [totalPrice, setTotalPrice] = useState<number>();

  const handleTurnGacha = () => {
    const BUDGET_LIMIT: number = 1000;

    let total: number = 0;

    let singleMenuGachaList: Menu[] = [];
    const mealMenuGachaList: Menu[] = [];

    while (total < BUDGET_LIMIT) {
      // 残金
      const remaining = BUDGET_LIMIT - total;

      // メニューリストから、残りの金額で買えるものだけに絞る
      // TODO: 値引きすれば買える可能性が考慮できていない
      const purchasableMenus = [...menuList].filter(
        (menu: Menu) => menu.price <= remaining
      );

      // 残りの金額で買えるものがなくなったら終了
      if (purchasableMenus.length === 0) break;

      // 購入可能なものから、ランダムに１つ選ぶ
      const randomIndex = Math.floor(Math.random() * purchasableMenus.length);
      const gachaMenu = lodash.cloneDeep(purchasableMenus[randomIndex]);
      gachaMenu.uuid = ulid();

      // 選ばれたメニューの金額
      const price = gachaMenu.price;

      // ガチャで選ばれた単品メニューから、値引き可能なフードを取得
      const discountFoodMenu = [...singleMenuGachaList, gachaMenu].filter(
        (menu: Menu) => menu.drinkDiscount > 0
      )[0];

      // ガチャで選ばれた単品メニューから、ドリンクを取得
      const discountDrinkMenu = [...singleMenuGachaList, gachaMenu].filter(
        (menu: Menu) =>
          menu.category === "hotdrink" || menu.category === "icedrink"
      )[0];

      if (discountDrinkMenu && discountFoodMenu) {
        // 値引き可能なセットが揃っている場合、値引きを行う
        total -= discountFoodMenu.drinkDiscount;

        // セットメニューのリストに追加
        mealMenuGachaList.push(discountFoodMenu);
        mealMenuGachaList.push(discountDrinkMenu);

        // 単品メニューのリストから削除
        singleMenuGachaList = singleMenuGachaList.filter(
          (menu: Menu) =>
            menu.uuid !== discountFoodMenu.uuid &&
            menu.uuid !== discountDrinkMenu.uuid
        );
      } else {
        // セットが揃わなかったら、単品として追加
        singleMenuGachaList.push(gachaMenu);
      }

      // BUDGET_LIMIT を超える場合は終了（値引き後に判定する必要がある）
      if (total + price > BUDGET_LIMIT) break;

      // 合計金額に加算
      total += price;
    }

    setGachaList([...mealMenuGachaList, ...singleMenuGachaList]);
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
            <ListItem
              key={menu.uuid}
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
          ))}
        </List>
      </>
    </Container>
  );
}

export default App;
