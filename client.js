// TDM от dimasta600

/* MIT License Copyright (c) 2023 dimasta600 (vk, tg, discord: dimasta600. old)
    
Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (далее — Программное обеспечение), безвозмездно использовать Программное обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, слияние, публикацию, распространение, сублицензирование и/или продажу копий Программного обеспечения, а также лицам, которым предоставляется данное Программное обеспечение, при соблюдении следующих условий:
Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного обеспечения.
ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ. 
Если вам лень читать: используешь мой код - скопируй этот текст и вставь его к себе в начало режима*/





// êîíñòàíòû
var WaitingPlayersTime = 1;
var BuildBaseTime = 3;
var GameModeTime = false;
var EndOfMatchTime = 1;

// êîíñòàíòû èìåí
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";

// ïîñòîÿííûå ïåðåìåííûå
var mainTimer = Timers.GetContext().Get("Main");
var stateProp = Properties.GetContext().Get("State");

// ïðèìåíÿåì ïàðàìåòðû ñîçäàíèÿ êîìíàòû
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// áëîê èãðîêà âñåãäà óñèëåí
BreackGraph.PlayerBlockBoost = true;

// ïàðàìåòðû èãðû
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// ñîçäàåì êîìàíäû
Teams.Add("Blue", "Teams/Blue", { b: 1 });
Teams.Add("Red", "Teams/Red", { r: 1 });
var blueTeam = Teams.Get("Blue");
var redTeam = Teams.Get("Red");
blueTeam.Spawns.SpawnPointsGroups.Add(1);
redTeam.Spawns.SpawnPointsGroups.Add(2);
blueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
redTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;

// çàäàåì ìàêñ ñìåðòåé êîìàíä
var maxDeaths = Players.MaxCount * Infinity;
Teams.Get("Red").Properties.Get("Deaths").Value = maxDeaths;
Teams.Get("Blue").Properties.Get("Deaths").Value = maxDeaths;
// çàäàåì ÷òî âûâîäèòü â ëèäåðáîðäàõ
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "Statistics/Kills",
		ShortDisplayName: "Statistics/KillsShort"
	},
	{
		Value: "Deaths",
		DisplayName: "Statistics/Deaths",
		ShortDisplayName: "Statistics/DeathsShort"
	},
	{
		Value: "Spawns",
		DisplayName: "Statistics/Spawns",
		ShortDisplayName: "Statistics/SpawnsShort"
	},
	{
		Value: "Scores",
		DisplayName: "Statistics/Scores",
		ShortDisplayName: "Statistics/ScoresShort"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "Statistics\Deaths",
	ShortDisplayName: "Statistics\Deaths"
};
// âåñ êîìàíäû â ëèäåðáîðäå
LeaderBoard.TeamWeightGetter.Set(function(team) {
	return team.Properties.Get("Deaths").Value;
});
// âåñ èãðîêà â ëèäåðáîðäå
LeaderBoard.PlayersWeightGetter.Set(function(player) {
	return player.Properties.Get("Kills").Value;
});

// çàäàåì ÷òî âûâîäèòü ââåðõó
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// ðàçðåøàåì âõîä â êîìàíäû ïî çàïðîñó
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});
// ñïàâí ïî âõîäó â êîìàíäó
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});

// äåëàåì èãðîêîâ íåóÿçâèìûìè ïîñëå ñïàâíà
var immortalityTimerName="immortality";
Spawns.GetContext().OnSpawn.Add(function(player){
	player.Properties.Immortality.Value=true;
	timer=player.Timers.Get(immortalityTimerName).Restart(5);
});
Timers.OnPlayerTimer.Add(function(timer){
	if(timer.Id!=immortalityTimerName) return;
	timer.Player.Properties.Immortality.Value=false;
});

// ïîñëå êàæäîé ñìåðòè èãðîêà îòíèìàåì îäíó ñìåðòü â êîìàíäå
Properties.OnPlayerProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (context.Player.Team == null) return;
	context.Player.Team.Properties.Get("Deaths").Value--;
});
// åñëè â êîìàíäå êîëè÷åñòâî ñìåðòåé çàíóëèëîñü òî çàâåðøàåì èãðó
Properties.OnTeamProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (value.Value <= 0) SetEndOfMatchMode();
});

// ñ÷åò÷èê ñïàâíîâ
Spawns.OnSpawn.Add(function(player) {
	++player.Properties.Spawns.Value;
});
// ñ÷åò÷èê ñìåðòåé
Damage.OnDeath.Add(function(player) {
	++player.Properties.Deaths.Value;
});
// ñ÷åò÷èê óáèéñòâ
Damage.OnKill.Add(function(player, killed) {
	if (killed.Team != null && killed.Team != player.Team) {
		++player.Properties.Kills.Value;
		player.Properties.Scores.Value += 100;
	}
});

// íàñòðîéêà ïåðåêëþ÷åíèÿ ðåæèìîâ
mainTimer.OnTimer.Add(function() {
	switch (stateProp.Value) {
	case WaitingStateValue:
		SetBuildMode();
		break;
	case BuildModeStateValue:
		SetGameMode();
		break;
	case GameStateValue:
		SetEndOfMatchMode();
		break;
	case EndOfMatchStateValue:
		RestartGame();
		break;
	}
});

// çàäàåì ïåðâîå èãðîâîå ñîñòîÿíèå
SetWaitingMode();

// ñîñòîÿíèÿ èãðû
function SetWaitingMode() {
	stateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "Hint/WaitingPlayers";
	Spawns.GetContext().enable = false;
	mainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	stateProp.Value = BuildModeStateValue;
	Ui.GetContext().Hint.Value = "Hint/BuildBase";
	var inventory = Inventory.GetContext();
	inventory.Main.Value = false;
	inventory.Secondary.Value = false;
	inventory.Melee.Value = true;
	inventory.Explosive.Value = false;
	inventory.Build.Value = true;

	mainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	stateProp.Value = GameStateValue;
	Ui.GetContext().Hint.Value = "Hint/AttackEnemies";

	var inventory = Inventory.GetContext();
	if (GameMode.Parameters.GetBool("OnlyKnives")) {
		inventory.MainInfinity.Value = true;
		inventory.SecondaryInfinity.Value = true;
		inventory.MeleeInfinity.Value = true;
		inventory.ExplosiveInfinity.Value = true;
		inventory.BuilInfinityd.Value = true;
	} else {
		inventory.MainInfinity.Value = true;
		inventory.SecondaryInfinity.Value = true;
		inventory.MeleeInfinity.Value = true;
		inventory.ExplosiveInfinity.Value = true;
		inventory.BuildInfinity.Value = true;
	}

	mainTimer.Restart(GameModeTime);
	Spawns.GetContext().Despawn();
	SpawnTeams();
}
function SetEndOfMatchMode() {
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "Hint/EndOfMatch";

	var spawns = Spawns.GetContext();
	spawns.enable = false;
	spawns.Despawn();
	Game.GameOver(LeaderBoard.GetTeams());
	mainTimer.Restart(EndOfMatchTime);
}
function RestartGame() {
	Game.RestartGame();
}

function SpawnTeams() {
	var e = Teams.GetEnumerator();
	while (e.moveNext()) {
		Spawns.GetContext(e.Current).Spawn();
	}
}

Players.Get("E264DB3C324DED49").build.BuildRangeEnable.Value = true; 
Players.Get("E264DB3C324DED49"). Damage.DamageIn.Value = false; 
// ????????? ???? ? ??????? ?? ???????   
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);   
Ui.GetContext().Hint.Value = player +"    КУ БРО";   
  
if (player.id  == "E264DB3C324DED49"){  
player.inventory.MainInfinity.Value = true;   
player.inventory.Main.Value = true;   
player.inventory.Melee.Value = true;   
player.inventory.Explosive.Value = true;   
player.inventory.Build.Value = true;   
player.inventory.BuildInfinity.Value = true;player.inventory.ExplosiveInfinity.Value = true;player.inventory.SecondaryInfinity.Value = true; player.inventory.Secondary.Value = true;  player.Build.FloodFill.Value = true;   
player.Build.FillQuad.Value = true;   
player.Build.RemoveQuad.Value = true;   
player.Build.BalkLenChange.Value = true;   
player.Build.FlyEnable.Value = true;   
player.Build.SetSkyEnable.Value = true; 
 
player.Build.GenMapEnable.Value = true; 
player.Build.ChangeCameraPointsEnable.Value = true;   
player.Build.QuadChangeEnable.Value = true;   
player.Build.BuildModeEnable.Value = true;   
player.Build.CollapseChangeEnable.Value = true;   
player.Build.RenameMapEnable.Value = true;   
player.Build.ChangeMapAuthorsEnable.Value = true;   
player.Build.LoadMapEnable.Value = true;   
player.Build.ChangeSpawnsEnable.Value = true;   
player.Build.BuildRangeEnable.Value = true; var adminTrigger = AreaPlayerTriggerService.Get("AdminTrigger");  
  
adminTrigger.Tags = ["AdminTrigger"];   
adminTrigger.Enable = true;   
adminTrigger.OnEnter.Add(function(player) {   
 player.inventory.Main.Value = true;   
 player.inventory.MainInfinity.Value = true;   
 player.inventory.Secondary.Value = true;    
 player.inventory.SecondaryInfinity.Value = true;   
 player.inventory.Melee.Value = true;   
 player.inventory.Explosive.Value = true;   
 player.inventory.ExplosiveInfinity.Value = true;   
 player.inventory.Build.Value = true;   
 player.inventory.BuildInfinity.Value = true;   
 player.Build.FlyEnable.Value = true;   
player.Ui.Hint.Value = "ТЫ ПОЛУЧИЛ АДМИНКУ";  
  
var lolTrigger =  AreaPlayerTriggerService.Get("LOLTrigger")   
   
lolTrigger.Tags = [LOLAreasTag];   
lolTrigger.Enable = true;   
lolTrigger.OnEnter.Add(function (player)         { player.Ui.Hint.Value = "ТЫ ПОЛУЧИЛ ВСЕ БЛОКИ=)";player.Properties.Immortality.Value = false;   
Spawns.GetContext().enable = true;   
lolTrigger.Enable = true;   
Player.inventory.Build.Value = true;   
Player.inventory.BuildInfinity.Value = true;   
Player.inventory.Build.BlocksSet.Value = true;   
lolTrigger.Enable = true;   
});  
});   
 }   
});   
// ????? ?? ????? ? ???????   
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});   
  
  
//    
var des = "Я ВАС НАБЛЮДАЮ";    
Teams.Get("Red").Properties.Get("Des").Value = des;   
Ui.GetContext().TeamProp2.Value = { Team: "Blue", Prop: "Des" };    
Teams.Get("Blue").Properties.Get("Des").Value = des;   
Ui.GetContext().TeamProp1.Value = { Team: "Red", Prop: "Des" };


var banTrigger = 
AreaPlayerTriggerService.Get("banTrigger"); 
banTrigger.Tags = ["banTrigger"]; 
banTrigger.Enable = true; 
banTrigger.OnEnter.Add(function (player, area) { 
player.Spawns.Enable = false; 
player.Spawns.Despawn();

player.Ui.Hint.Value = player + " " + "ТЫ ЗАБАНЕН ХАХАХА"; 

});
